import { z } from 'zod'
import { requireOrgSession, type OwnedOrganization } from '@/lib/eckeOrgAuth'
import { notifyEventDiscovery } from '@/lib/eckeEventDiscovery'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { sanitizeOrgHtml } from '@/lib/eckeOrgRichText'
import {
  ORG_EVENT_KINDS,
  buildEventSeoKeywords,
  buildEventSeoTitle,
  currentTicketTier,
  dbEventTypeToOrgKind,
  normalizeTicketTiers,
  orgKindToDbEventType,
  parseOrganizerLines,
  priceRangeFromTiers,
  slugifyEventSlug,
  type ManagedEventRow,
  type OrgEventInput,
  type OrgEventKind,
  type OwnedPlaceLink,
} from '@/lib/eckeOrgEventShared'

export { publicEventLifecycle } from '@/lib/eckeOrgEventShared'
export type { ManagedEventRow, OrgEventInput, OrgEventKind } from '@/lib/eckeOrgEventShared'
export { ORG_EVENT_KINDS }

export const RESERVED_EVENT_SLUGS = new Set(['create', 'my-events', 'page'])

const KIND_CATEGORY: Record<OrgEventKind, string> = {
  party: 'Party',
  convention: 'Convention',
  munch: 'Munch',
  educational: 'Class',
  social: 'Social',
  play_event: 'Play party',
  retreat: 'Retreat',
  fundraiser: 'Fundraiser',
  other: 'Event',
}

const KIND_TAGS: Record<OrgEventKind, string[]> = {
  party: ['play-party'],
  convention: ['convention'],
  munch: ['munch'],
  educational: ['classes'],
  social: ['bdsm-social'],
  play_event: ['play-party'],
  retreat: ['convention'],
  fundraiser: ['bdsm-social'],
  other: [],
}

export type EventCapability = 'view' | 'edit' | 'post' | 'media' | 'settings' | 'delete'

export type EventMemberRole = 'owner' | 'manager' | 'contributor'

const ROLE_CAPABILITIES: Record<EventMemberRole, EventCapability[]> = {
  owner: ['view', 'edit', 'post', 'media', 'settings', 'delete'],
  manager: ['view', 'edit', 'post', 'media'],
  contributor: ['view', 'post', 'media'],
}

function optionalUrl(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim()
  if (!raw) return undefined
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export function sanitizeEventHtml(input: string): string {
  return sanitizeOrgHtml(input)
}

export const orgEventSchema = z
  .object({
    title: z.string().min(3).max(120),
    slug: z.string().max(80).optional().or(z.literal('')),
    shortDescription: z.string().min(10).max(280),
    kind: z.enum(ORG_EVENT_KINDS),
    organizer: z.string().max(120).optional().or(z.literal('')),
    website: z.string().max(500).optional().or(z.literal('')),
    startDate: z.string().min(8),
    startTime: z.string().max(20).optional().or(z.literal('')),
    endDate: z.string().min(8),
    endTime: z.string().max(20).optional().or(z.literal('')),
    doorsOpen: z.string().max(20).optional().or(z.literal('')),
    isOnline: z.boolean().optional(),
    venue: z.string().max(120).optional().or(z.literal('')),
    city: z.string().max(80).optional().or(z.literal('')),
    state: z.string().max(2).optional().or(z.literal('')),
    address: z.string().max(200).optional().or(z.literal('')),
    showAddressPublicly: z.boolean().optional(),
    longDescription: z.string().min(10).max(20000),
    coverImage: z.string().max(800).optional().or(z.literal('')),
    gallery: z.string().max(4000).optional().or(z.literal('')),
    ticketUrl: z.string().max(500).optional().or(z.literal('')),
    registrationRequired: z.boolean().optional(),
    ticketPrice: z.string().max(80).optional().or(z.literal('')),
    priceRange: z.string().max(80).optional().or(z.literal('')),
    registrationDeadline: z.string().max(20).optional().or(z.literal('')),
    ticketTiers: z
      .array(
        z.object({
          label: z.string().max(60).optional().or(z.literal('')),
          startsOn: z.string().max(10).optional().or(z.literal('')),
          endsOn: z.string().max(10).optional().or(z.literal('')),
          price: z.string().max(40).optional().or(z.literal('')),
        }),
      )
      .max(8)
      .optional(),
    ageRestriction: z.string().max(20).optional().or(z.literal('')),
    accessibility: z.string().max(500).optional().or(z.literal('')),
    dressCode: z.string().max(500).optional().or(z.literal('')),
    photographyPolicy: z.string().max(500).optional().or(z.literal('')),
    parking: z.string().max(500).optional().or(z.literal('')),
    hotelInformation: z.string().max(500).optional().or(z.literal('')),
    foodDrink: z.string().max(500).optional().or(z.literal('')),
    vendorArea: z.string().max(500).optional().or(z.literal('')),
    features: z.string().max(4000).optional().or(z.literal('')),
    whyGo: z.string().max(2000).optional().or(z.literal('')),
    status: z.enum(['draft', 'published']).optional(),
    hostAtPlace: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.isOnline && !value.hostAtPlace) {
      if (!value.city?.trim()) ctx.addIssue({ code: 'custom', path: ['city'], message: 'City is required' })
      if (!value.state?.trim() || value.state.trim().length !== 2) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'State is required' })
      }
    }
    if (value.endDate < value.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must be on or after the start date' })
    }
    ;(value.ticketTiers || []).forEach((tier, index) => {
      const filled = Boolean(tier.startsOn || tier.endsOn || tier.price || tier.label)
      if (!filled) return
      if (!tier.startsOn || !tier.endsOn || !tier.price?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['ticketTiers', index], message: 'Each price tier needs a start, end, and price' })
      } else if (tier.endsOn < tier.startsOn) {
        ctx.addIssue({ code: 'custom', path: ['ticketTiers', index], message: 'Tier end date must be on or after the start date' })
      }
    })
  })

export const orgEventPostSchema = z.object({
  title: z.string().min(3).max(160),
  body: z.string().min(3).max(8000),
  imageUrl: z.string().max(800).optional().or(z.literal('')),
  publishMode: z.enum(['now', 'schedule']).optional(),
  publishAt: z.string().optional().or(z.literal('')),
})

export type OrgEventPostInput = z.infer<typeof orgEventPostSchema>

export function toOrgEventInput(value: z.infer<typeof orgEventSchema>): OrgEventInput {
  return {
    ...value,
    ticketTiers: normalizeTicketTiers(value.ticketTiers),
  }
}

export const MANAGED_EVENT_SELECT = [
  'id',
  'title',
  'slug',
  'start_date',
  'end_date',
  'start_time',
  'end_time',
  'doors_open',
  'city',
  'state',
  'venue',
  'address',
  'show_address_publicly',
  'is_online',
  'category',
  'event_type',
  'short_description',
  'long_description',
  'website',
  'logo',
  'hero_image',
  'images',
  'program_url',
  'map_url',
  'staff_application_url',
  'vendor_application_url',
  'presenter_application_url',
  'photographer_application_url',
  'staff_applications_open',
  'vendor_applications_open',
  'presenter_applications_open',
  'photographer_applications_open',
  'ticket_url',
  'registration_required',
  'ticket_price',
  'price_range',
  'registration_deadline',
  'ticket_tiers',
  'age_restriction',
  'accessibility',
  'dress_code',
  'photography_policy',
  'parking',
  'hotel_information',
  'food_drink',
  'vendor_area',
  'features',
  'includes',
  'organizer_name',
  'status',
  'views',
  'archived_at',
  'organization_id',
  'dungeon_venue_id',
  'dungeon_slug',
].join(', ')

export async function requireOrgApiSession() {
  const session = await requireOrgSession()
  if (!session) return { error: 'Sign in to manage events', status: 401 as const, session: null, admin: null }
  const admin = getSupabaseAdminClient()
  if (!admin) return { error: 'Database not configured', status: 500 as const, session: null, admin: null }
  return { error: null, status: 200 as const, session, admin }
}

export function roleHasCapability(role: EventMemberRole, capability: EventCapability) {
  return ROLE_CAPABILITIES[role].includes(capability)
}

export { applyPlaceLinkToEventInput } from '@/lib/eckeOrgEventShared'
export type { OwnedPlaceLink } from '@/lib/eckeOrgEventShared'

export async function fetchOwnedPlaceLink(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  orgId: string,
): Promise<OwnedPlaceLink | null> {
  const { data } = await admin
    .from('dungeon_venues')
    .select('id, slug, name, city, state, street_address, private_address')
    .eq('organization_id', orgId)
    .maybeSingle()
  return (data as OwnedPlaceLink | null) || null
}

export async function resolveEventRole(userId: string, org: OwnedOrganization, eventId: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data: member } = await admin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle()
  if (member?.role === 'owner' || member?.role === 'manager' || member?.role === 'contributor') {
    return member.role as EventMemberRole
  }
  const { data: event } = await admin.from('events').select('organization_id').eq('id', eventId).maybeSingle()
  if (event?.organization_id === org.id) return 'owner'
  return null
}

export async function requireEventCapability(slug: string, capability: EventCapability) {
  const gated = await requireOrgApiSession()
  if (gated.error || !gated.session || !gated.admin) {
    return { ...gated, event: null, role: null }
  }
  const { data } = await gated.admin
    .from('events')
    .select(MANAGED_EVENT_SELECT)
    .eq('slug', slug)
    .maybeSingle()
  if (!data) return { ...gated, error: 'Event not found', status: 404 as const, event: null, role: null }
  const event = data as unknown as ManagedEventRow
  const role = await resolveEventRole(gated.session.user.id, gated.session.organization, event.id)
  if (!role || !roleHasCapability(role, capability)) {
    return { ...gated, error: 'You do not manage this event', status: 403 as const, event: null, role: null }
  }
  return { ...gated, error: null, status: 200 as const, event, role }
}

export async function takeRequestedEventSlug(raw: string, excludeId?: string) {
  const root = slugifyEventSlug(raw)
  if (root.length < 3) return { error: 'Slug needs at least 3 letters or numbers' }
  if (RESERVED_EVENT_SLUGS.has(root)) return { error: 'That URL is reserved. Try another slug.' }
  const admin = getSupabaseAdminClient()
  if (!admin) return { slug: root }
  let query = admin.from('events').select('id').eq('slug', root)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.maybeSingle()
  if (data) return { error: 'That URL is already in use. Choose another slug.' }
  return { slug: root }
}

export async function uniqueEventSlug(title: string, excludeId?: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return slugifyEventSlug(title) || 'event'
  const root = slugifyEventSlug(title) || 'event'
  const safeRoot = RESERVED_EVENT_SLUGS.has(root) ? `${root}-event` : root
  for (let i = 0; i < 8; i += 1) {
    const candidate = i === 0 ? safeRoot : `${safeRoot}-${i + 1}`
    let query = admin.from('events').select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
  }
  return `${safeRoot}-${Date.now().toString(36)}`
}

export function eventWritePayload(
  input: OrgEventInput,
  org: OwnedOrganization,
  slug: string,
  placeLink?: { dungeon_venue_id: string | null; dungeon_slug: string | null },
) {
  const online = Boolean(input.isOnline)
  const status = input.status === 'draft' ? 'draft' : 'published'
  const tiers = normalizeTicketTiers(input.ticketTiers)
  const current = currentTicketTier(tiers)
  const gallery = (input.gallery || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return {
    title: input.title.trim(),
    slug,
    start_date: input.startDate,
    end_date: input.endDate,
    start_time: input.startTime?.trim() || null,
    end_time: input.endTime?.trim() || null,
    doors_open: input.doorsOpen?.trim() || null,
    display_date: input.startDate === input.endDate ? input.startDate : `${input.startDate} – ${input.endDate}`,
    is_online: online,
    city: online ? 'Online' : input.city!.trim(),
    state: online ? 'US' : input.state!.trim().toUpperCase(),
    venue: online ? input.venue?.trim() || 'Online' : input.venue?.trim() || null,
    address: input.address?.trim() || null,
    show_address_publicly: Boolean(input.showAddressPublicly),
    short_description: input.shortDescription.trim(),
    long_description: sanitizeEventHtml(input.longDescription.trim()),
    category: KIND_CATEGORY[input.kind],
    event_type: orgKindToDbEventType(input.kind),
    tags: KIND_TAGS[input.kind],
    website: optionalUrl(input.website) ?? null,
    ticket_url: optionalUrl(input.ticketUrl) ?? null,
    logo: optionalUrl(input.coverImage) ?? null,
    images: gallery,
    registration_required: Boolean(input.registrationRequired),
    ticket_price: current?.price || input.ticketPrice?.trim() || null,
    price_range: priceRangeFromTiers(tiers) || input.priceRange?.trim() || null,
    registration_deadline: input.registrationDeadline?.trim() || null,
    ticket_tiers: tiers,
    age_restriction: input.ageRestriction?.trim() || null,
    accessibility: input.accessibility?.trim() || null,
    dress_code: input.dressCode?.trim() || null,
    photography_policy: input.photographyPolicy?.trim() || null,
    parking: input.parking?.trim() || null,
    hotel_information: input.hotelInformation?.trim() || null,
    food_drink: input.foodDrink?.trim() || null,
    vendor_area: input.vendorArea?.trim() || null,
    features: JSON.stringify(parseOrganizerLines(input.features, 12)),
    includes: parseOrganizerLines(input.whyGo, 4).join('\n') || null,
    organizer: (input.organizer || org.name).trim(),
    organizer_name: (input.organizer || org.name).trim(),
    email: org.email,
    organization_id: org.id,
    dungeon_venue_id: placeLink?.dungeon_venue_id ?? null,
    dungeon_slug: placeLink?.dungeon_slug ?? null,
    status,
    archived_at: null,
    published_at: status === 'published' ? new Date().toISOString() : null,
    seo_title: buildEventSeoTitle({
      title: input.title.trim(),
      city: input.city,
      state: input.state,
      startDate: input.startDate,
      isOnline: online,
    }),
    seo_description: input.shortDescription.trim().slice(0, 160),
    seo_keywords: buildEventSeoKeywords({
      title: input.title.trim(),
      city: input.city,
      state: input.state,
      kind: input.kind,
      isOnline: online,
    }),
  }
}

export async function writeEventAudit(
  eventId: string,
  orgId: string,
  userId: string,
  action: string,
  summary: string,
) {
  const admin = getSupabaseAdminClient()
  if (!admin) return
  await admin.from('event_audit_log').insert({
    event_id: eventId,
    organization_id: orgId,
    actor_user_id: userId,
    action,
    summary,
  })
}

export function notifyEventIndex(
  slug: string,
  stateAbbr?: string | null,
  reason: 'publish' | 'update' | 'unpublish' | 'archive' | 'delete' = 'publish',
) {
  notifyEventDiscovery({ slug, stateAbbr, reason })
}

export async function listManagedEvents(orgId: string): Promise<ManagedEventRow[]> {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data, error } = await admin
    .from('events')
    .select(MANAGED_EVENT_SELECT)
    .eq('organization_id', orgId)
    .order('start_date', { ascending: false })
  if (error || !data) return []
  const events = data as unknown as ManagedEventRow[]
  const ids = events.map((event) => event.id)
  if (!ids.length) return events
  const { data: posts } = await admin.from('event_posts').select('event_id').in('event_id', ids)
  const counts = new Map<string, number>()
  for (const post of posts || []) {
    const id = String((post as { event_id: string }).event_id)
    counts.set(id, (counts.get(id) || 0) + 1)
  }
  return events.map((event) => ({ ...event, post_count: counts.get(event.id) || 0 }))
}

export async function listPublishedEventPostsBySlug(slug: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data } = await admin.from('events').select('id').eq('slug', slug).maybeSingle()
  if (!data) return []
  return listPublishedEventPosts(String((data as { id: string }).id))
}

export async function listPublishedEventPosts(eventId: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data } = await admin
    .from('event_posts')
    .select('id, title, body, image_url, published_at, created_at')
    .eq('event_id', eventId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return data || []
}

export async function listAllEventPosts(eventId: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data } = await admin
    .from('event_posts')
    .select('id, title, body, image_url, status, published_at, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function listEventAudit(eventId: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data } = await admin
    .from('event_audit_log')
    .select('id, action, summary, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data || []
}

export function managedToFormValues(event: ManagedEventRow): Partial<OrgEventInput> {
  return {
    title: event.title,
    slug: event.slug,
    shortDescription: event.short_description || '',
    kind: dbEventTypeToOrgKind(event.event_type),
    organizer: event.organizer_name || '',
    website: event.website || '',
    startDate: event.start_date,
    startTime: event.start_time || '',
    endDate: event.end_date,
    endTime: event.end_time || '',
    doorsOpen: event.doors_open || '',
    isOnline: event.is_online,
    venue: event.venue || '',
    city: event.is_online ? '' : event.city,
    state: event.is_online ? '' : event.state,
    address: event.address || '',
    showAddressPublicly: event.show_address_publicly,
    longDescription: event.long_description || '',
    coverImage: event.logo || '',
    gallery: (event.images || []).join('\n'),
    ticketUrl: event.ticket_url || '',
    registrationRequired: event.registration_required,
    ticketPrice: event.ticket_price || '',
    priceRange: event.price_range || '',
    registrationDeadline: event.registration_deadline || '',
    ticketTiers: normalizeTicketTiers(event.ticket_tiers),
    ageRestriction: event.age_restriction || '',
    accessibility: event.accessibility || '',
    dressCode: event.dress_code || '',
    photographyPolicy: event.photography_policy || '',
    parking: event.parking || '',
    hotelInformation: event.hotel_information || '',
    foodDrink: event.food_drink || '',
    vendorArea: event.vendor_area || '',
    features: (() => {
      const raw = event.features
      if (Array.isArray(raw)) return parseOrganizerLines(raw.join('\n'), 12).join('\n')
      const text = String(raw || '').trim()
      if (!text) return ''
      try {
        const parsed = JSON.parse(text) as unknown
        if (Array.isArray(parsed)) return parseOrganizerLines(parsed.join('\n'), 12).join('\n')
      } catch {
        /* freeform */
      }
      return parseOrganizerLines(text, 12).join('\n')
    })(),
    whyGo: parseOrganizerLines(event.includes, 4).join('\n'),
    status: event.status === 'draft' ? 'draft' : 'published',
    hostAtPlace: Boolean(event.dungeon_venue_id || event.dungeon_slug),
  }
}
