import { getAllEvents, getEventBySlug } from '@/data/events'
import { getSupabaseClient } from '@/lib/supabase'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { resolveEntityHeroAndGallery, type EntityHeroGalleryItem } from '@/lib/kinkSocialEntityMedia'
import { KNOWN_TAG_SLUGS } from '@/lib/discoveryTags'
import { BASE_URL } from '@/lib/seo'
import { normalizeTicketTiers, type EventTicketTier } from '@/lib/eckeOrgEventShared'

/** Collapse absolute ECKE self-host image URLs to `/images/...` for Next/Image. */
export function normalizeEckeSelfHostLogo(logo: string | undefined | null): string | undefined {
  const raw = logo?.trim()
  if (!raw) return undefined
  const rewritten = raw.replace(/^https?:\/\/(?:www\.)?eastcoastkinkevents\.com(\/images\/)/i, '$1')
  return rewritten || undefined
}

export type UnifiedEvent = {
  name: string
  slug: string
  date: { start: string; end: string; display: string }
  location: { city: string; state: string; region: string }
  excerpt: string
  category: string
  logo?: string
  /** Normalized tag slugs for filtering (inferred for static, DB for Supabase) */
  tagSlugs: string[]
  source: 'static' | 'supabase'
  c2kSourceId?: string | null
  c2kSourceType?: string | null
  dancecardEnabled?: boolean
  organizer?: string
  lastSyncedAt?: string
  eventKind?: string | null
  dungeonSlug?: string | null
  dungeonVenueId?: string | null
  /** Host venue name when published (e.g. The Korral). */
  venue?: string | null
  /** Sticky featured / sponsor pin from events.js `isFeatured` or events.featured. */
  featured?: boolean
  /** Owning ECKE organization when this is an org-managed listing. */
  organizationId?: string | null
}

function slugifyTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Map freeform tag / category text to canonical slugs */
export function inferTagsForStaticEvent(event: {
  name: string
  excerpt: string
  category: string
  longDescription?: string
}): string[] {
  const text = `${event.name} ${event.excerpt} ${event.category} ${event.longDescription || ''}`.toLowerCase()
  const tags = new Set<string>()

  const add = (s: string) => {
    if (KNOWN_TAG_SLUGS.has(s)) tags.add(s)
  }

  if (/munch/i.test(event.category) || /\bmunch\b/i.test(text)) add('munch')
  if (/play\s*party|play party/i.test(event.category) || /\bplay party\b/i.test(text)) add('play-party')
  if (/class|workshop|education/i.test(event.category) || /\bworkshop|class\b/i.test(text)) add('classes')
  if (/convention|conference|weekend event/i.test(event.category)) add('convention')
  if (/rope|shibari|kinbaku/i.test(text)) add('rope')
  if (/impact|flogger|spanking/i.test(text)) add('impact')
  if (/lgbtq|lgbt|queer|trans/i.test(text)) add('lgbtq-friendly')
  if (/beginner|newcomer|101|first timer/i.test(text)) add('beginner-friendly')
  if (/outdoor|public park/i.test(event.category) || /\boutdoor\b/i.test(text)) add('public')
  if (/private|members only|invite/i.test(text)) add('private')
  if (/femdom|dominatrix|mistress/i.test(text)) add('femdom')
  if (/latex|rubber|fetish fashion/i.test(text)) add('latex-fetish')
  if (/dungeon/i.test(text)) add('dungeon-events')
  if (/social|meetup|mixer/i.test(event.category)) add('bdsm-social')

  return Array.from(tags)
}

function staticToUnified(e: ReturnType<typeof getAllEvents>[number]): UnifiedEvent {
  const raw = e as ReturnType<typeof getAllEvents>[number] & {
    dancecardEnabled?: boolean
    dancecardSlug?: string
    organizer?: string
    isFeatured?: boolean
    featured?: boolean
    eventKind?: string | null
    event_type?: string | null
    dungeonSlug?: string | null
    dungeon_slug?: string | null
    venue?: string | null
  }
  return {
    name: e.name,
    slug: e.slug,
    date: e.date,
    location: e.location,
    excerpt: e.excerpt,
    category: e.category,
    logo: e.logo,
    tagSlugs: inferTagsForStaticEvent({
      name: e.name,
      excerpt: e.excerpt,
      category: e.category,
      longDescription: (e as { longDescription?: string }).longDescription,
    }),
    source: 'static',
    dancecardEnabled: Boolean(raw.dancecardEnabled || raw.dancecardSlug),
    organizer: raw.organizer,
    eventKind: raw.eventKind || raw.event_type || undefined,
    dungeonSlug: raw.dungeonSlug || raw.dungeon_slug || undefined,
    venue: raw.venue || (e as { venue?: string }).venue || undefined,
    featured: Boolean(raw.isFeatured || raw.featured),
  }
}

function normalizeDbTags(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((t) => slugifyTag(String(t))).filter(Boolean)
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((t) => slugifyTag(t))
      .filter(Boolean)
  }
  return []
}

function dbRowToUnified(row: Record<string, unknown>): UnifiedEvent | null {
  const slug = row.slug as string | undefined
  if (!slug) return null
  const start = (row.start_date as string)?.slice(0, 10) || ''
  const end = (row.end_date as string)?.slice(0, 10) || start
  const display = (row.display_date as string) || start
  return {
    name: (row.title as string) || slug,
    slug,
    date: { start, end, display },
    location: {
      city: String(row.city || ''),
      state: String(row.state || '').toUpperCase().slice(0, 2),
      region: '',
    },
    excerpt: (row.short_description as string) || '',
    category: (row.category as string) || 'Event',
    // Absolute self-host URLs break Next/Image unless remotePatterns allow them;
    // prefer site-relative `/images/...` so the optimizer treats them as local.
    logo: normalizeEckeSelfHostLogo((row.logo as string) || undefined),
    tagSlugs: normalizeDbTags(row.tags),
    source: 'supabase',
    c2kSourceId: (row.c2k_source_id as string | null) ?? null,
    c2kSourceType: (row.c2k_source_type as string | null) ?? null,
    // `events` has last_synced_at (C2K ingest); no updated_at column in live schema.
    lastSyncedAt: String(row.last_synced_at || '').slice(0, 10) || undefined,
    organizer: ((row.organizer_name as string) || (row.organizer as string))?.trim() || undefined,
    eventKind: (row.event_type as string | null) ?? null,
    dungeonSlug: (row.dungeon_slug as string | null) ?? null,
    dungeonVenueId: (row.dungeon_venue_id as string | null) ?? null,
    venue: ((row.venue as string) || '').trim() || null,
    featured: Boolean(row.featured),
    organizationId: (row.organization_id as string | null) ?? null,
  }
}

/**
 * Published events from Supabase (submissions pipeline). Fails soft if DB unavailable.
 */
export async function fetchPublishedSupabaseEvents(): Promise<UnifiedEvent[]> {
  // Server Components / route handlers — browser client is always null in Node.
  const client = getSupabaseServerClient() ?? getSupabaseClient()
  if (!client) {
    console.error('[unifiedEvents] list: Supabase server client unavailable')
    return []
  }
  try {
    const { data, error } = await client
      .from('events')
      .select(
        'title, slug, start_date, end_date, display_date, city, state, short_description, category, logo, tags, status, c2k_source_id, c2k_source_type, last_synced_at, organizer, organizer_name, event_type, dungeon_slug, dungeon_venue_id, venue, featured, organization_id'
      )
      .eq('status', 'published')

    if (error) {
      console.error('[unifiedEvents] list query failed:', error.message, error.code)
      return []
    }
    if (!data?.length) return []
    const rows = data as Record<string, unknown>[]
    return rows.map(dbRowToUnified).filter((e): e is UnifiedEvent => e !== null)
  } catch (err) {
    console.error('[unifiedEvents] list unexpected error:', err)
    return []
  }
}

/**
 * Static + published DB events.
 * Default: static wins on duplicate slug (same event in both places uses `events.js`).
 * Set `UNIFIED_EVENTS_PREFER_DB=true` after migrating static data to Supabase so DB rows win.
 */
export async function getUnifiedEvents(): Promise<UnifiedEvent[]> {
  const preferDb = process.env.UNIFIED_EVENTS_PREFER_DB === 'true'
  const staticUnified = getAllEvents().map(staticToUnified)
  const bySlug = new Map<string, UnifiedEvent>()
  const remote = await fetchPublishedSupabaseEvents()

  if (preferDb) {
    for (const e of staticUnified) {
      bySlug.set(e.slug, e)
    }
    for (const e of remote) {
      bySlug.set(e.slug, e)
    }
  } else {
    for (const e of staticUnified) {
      bySlug.set(e.slug, e)
    }
    for (const e of remote) {
      const existing = bySlug.get(e.slug)
      if (e.c2kSourceId) {
        // C2K wins; keep static logo when publish left logo empty (seed URLs are stripped).
        bySlug.set(e.slug, existing?.logo && !e.logo ? { ...e, logo: existing.logo } : e)
      } else if (!existing) {
        bySlug.set(e.slug, e)
      }
    }
    // kink.social rows with source ID win over static when slug differs but same source ID
    for (const e of remote) {
      if (!e.c2kSourceId) continue
      for (const [slug, existing] of Array.from(bySlug.entries())) {
        if (slug !== e.slug && existing.c2kSourceId === e.c2kSourceId) {
          bySlug.delete(slug)
        }
      }
    }
  }
  return Array.from(bySlug.values()).sort(
    (a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()
  )
}

export function getUpcomingUnified(events: UnifiedEvent[]): UnifiedEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return events
    .filter((e) => new Date(e.date.end) >= today)
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
}

/** Same shape as static `events.js` entries — used by `/events/[slug]`, SEO, and structured data. */
export type EventPageRecord = {
  name: string
  slug: string
  date: { start: string; end: string; display: string }
  location: { city: string; state: string; region: string }
  category: string
  excerpt: string
  longDescription?: string
  website: string
  organizer?: string
  venue?: string
  logo?: string
  features?: string[]
  whyGo?: string[]
  seo?: { title: string; description: string; keywords: string }
  c2kSourceId?: string | null
  c2kSourceType?: string | null
  gallery?: EntityHeroGalleryItem[]
  organizationId?: string | null
  isOnline?: boolean
  address?: string | null
  showAddressPublicly?: boolean
  ticketUrl?: string | null
  ageRestriction?: string | null
  status?: string | null
  heroImage?: string | null
  programUrl?: string | null
  mapUrl?: string | null
  staffApplicationUrl?: string | null
  vendorApplicationUrl?: string | null
  presenterApplicationUrl?: string | null
  photographerApplicationUrl?: string | null
  staffApplicationsOpen?: boolean | null
  vendorApplicationsOpen?: boolean | null
  presenterApplicationsOpen?: boolean | null
  photographerApplicationsOpen?: boolean | null
  ticketTiers?: EventTicketTier[]
  registrationDeadline?: string | null
  ticketPrice?: string | null
  priceRange?: string | null
  hotelInformation?: string | null
  parking?: string | null
  foodDrink?: string | null
}

function parseDbFeatures(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  const s = String(raw).trim()
  if (!s) return []
  try {
    const parsed = JSON.parse(s) as unknown
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean)
  } catch {
    // freeform text
  }
  return s
    .split(/\r?\n/)
    .flatMap((line) => line.split(';').map((part) => part.trim()))
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

function formatSeoKeywords(raw: unknown): string {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean).join(', ')
  return String(raw || '').trim()
}

function dbRowToEventPageRecord(row: Record<string, unknown>): EventPageRecord | null {
  const slug = row.slug as string | undefined
  if (!slug) return null
  const start = (row.start_date as string)?.slice(0, 10) || ''
  const end = (row.end_date as string)?.slice(0, 10) || start
  const display = ((row.display_date as string) || '').trim() || start
  const city = String(row.city || '').trim()
  const stateAbbr = String(row.state || '')
    .toUpperCase()
    .slice(0, 2)
  const excerpt = (row.short_description as string)?.trim() || ''
  const longDesc = (row.long_description as string)?.trim() || ''
  const title = ((row.title as string) || slug).trim()
  const websiteRaw = (row.website as string)?.trim()
  const fallbackUrl = `${BASE_URL}/events/${encodeURIComponent(slug)}`
  const website = websiteRaw || fallbackUrl
  const organizer =
    ((row.organizer_name as string) || (row.organizer as string))?.trim() || undefined
  const venue = (row.venue as string)?.trim() || undefined
  const metaTitle = ((row.meta_title as string) || (row.seo_title as string))?.trim()
  const metaDesc = ((row.meta_description as string) || (row.seo_description as string))?.trim()
  const kw = formatSeoKeywords(row.seo_keywords)

  return {
    name: title,
    slug,
    date: { start, end, display },
    location: {
      city,
      state: stateAbbr,
      // Don't invent region as "City, ST" — masthead already shows city/state and that duplicates.
      region: '',
    },
    category: ((row.category as string) || 'Event').trim(),
    excerpt: excerpt || longDesc.slice(0, 280) || `${title} — kink event in ${city || stateAbbr || 'your area'}.`,
    longDescription: longDesc || undefined,
    website,
    organizer,
    venue,
    logo: normalizeEckeSelfHostLogo((row.logo as string)?.trim() || undefined),
    features: parseDbFeatures(row.features),
    whyGo: parseDbFeatures(row.includes),
    hotelInformation: (row.hotel_information as string | null) ?? null,
    parking: (row.parking as string | null) ?? null,
    foodDrink: (row.food_drink as string | null) ?? null,
    c2kSourceId: (row.c2k_source_id as string | null) ?? null,
    c2kSourceType: (row.c2k_source_type as string | null) ?? null,
    organizationId: (row.organization_id as string | null) ?? null,
    heroImage: (row.hero_image as string | null) ?? null,
    programUrl: (row.program_url as string | null) ?? null,
    mapUrl: (row.map_url as string | null) ?? null,
    staffApplicationUrl: (row.staff_application_url as string | null) ?? null,
    vendorApplicationUrl: (row.vendor_application_url as string | null) ?? null,
    presenterApplicationUrl: (row.presenter_application_url as string | null) ?? null,
    photographerApplicationUrl: (row.photographer_application_url as string | null) ?? null,
    staffApplicationsOpen: Boolean(row.staff_applications_open),
    vendorApplicationsOpen: Boolean(row.vendor_applications_open),
    presenterApplicationsOpen: Boolean(row.presenter_applications_open),
    photographerApplicationsOpen: Boolean(row.photographer_applications_open),
    ticketTiers: normalizeTicketTiers(row.ticket_tiers),
    registrationDeadline: (row.registration_deadline as string | null) ?? null,
    ticketPrice: (row.ticket_price as string | null) ?? null,
    priceRange: (row.price_range as string | null) ?? null,
    isOnline: Boolean(row.is_online),
    address: (row.address as string | null) ?? null,
    showAddressPublicly: Boolean(row.show_address_publicly),
    ticketUrl: (row.ticket_url as string | null) ?? null,
    ageRestriction: (row.age_restriction as string | null) ?? null,
    status: (row.status as string | null) ?? null,
    gallery: Array.isArray(row.images)
      ? (row.images as unknown[])
          .map((item, index) => ({
            publicUrl: String(item || '').trim(),
            ordinal: index,
            altText: title,
          }))
          .filter((item) => item.publicUrl)
      : undefined,
    seo: {
      title: metaTitle || title,
      description: (metaDesc || excerpt || longDesc).slice(0, 320),
      keywords: kw || [title, city, stateAbbr, 'kink events', 'BDSM'].filter(Boolean).join(', '),
    },
  }
}

const EVENT_PAGE_COLUMNS = [
  'title',
  'slug',
  'start_date',
  'end_date',
  'display_date',
  'city',
  'state',
  'short_description',
  'long_description',
  'category',
  'logo',
  'status',
  'website',
  'features',
  'includes',
  'venue',
  'organizer',
  'organizer_name',
  'seo_title',
  'seo_description',
  'seo_keywords',
  'meta_title',
  'meta_description',
  'c2k_source_id',
  'c2k_source_type',
  'organization_id',
  'is_online',
  'address',
  'show_address_publicly',
  'ticket_url',
  'age_restriction',
  'images',
  'hero_image',
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
  'ticket_tiers',
  'registration_deadline',
  'ticket_price',
  'price_range',
  'hotel_information',
  'parking',
  'food_drink',
].join(', ')

/**
 * Published event from Supabase as a full page record (for `/events/[slug]` when not in static data).
 */
export async function fetchPublishedSupabaseEventAsPageEvent(
  slug: string
): Promise<EventPageRecord | null> {
  // Server Components — browser client is always null in Node.
  const client = getSupabaseServerClient() ?? getSupabaseClient()
  if (!client) {
    console.error('[unifiedEvents] detail: Supabase server client unavailable')
    return null
  }
  try {
    const { data, error } = await client
      .from('events')
      .select(EVENT_PAGE_COLUMNS)
      .in('status', ['published', 'archived'])
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[unifiedEvents] detail query failed:', slug, error.message, error.code)
      return null
    }
    if (!data) return null
    const record = dbRowToEventPageRecord(data as unknown as Record<string, unknown>)
    if (!record) return null
    const { heroUrl, gallery } = await resolveEntityHeroAndGallery(client, 'event', slug, record.logo)
    const heroChanged = Boolean(heroUrl && heroUrl !== record.logo)
    const hasGallery = gallery.length > 0
    if (!heroChanged && !hasGallery) return record
    return {
      ...record,
      ...(heroChanged ? { logo: heroUrl! } : {}),
      ...(hasGallery ? { gallery } : {}),
    }
  } catch (err) {
    console.error('[unifiedEvents] detail unexpected error:', slug, err)
    return null
  }
}

/**
 * Resolve an event for the public detail page — matches `getUnifiedEvents` precedence for slug conflicts.
 */
export async function resolveEventForPage(slug: string): Promise<EventPageRecord | null> {
  const preferDb = process.env.UNIFIED_EVENTS_PREFER_DB === 'true'
  const trySlugs = [slug]
  // Shared/year-suffixed URLs (e.g. …-weekend-2026) → canonical without trailing year.
  const withoutYear = slug.replace(/-20\d{2}$/, '')
  if (withoutYear && withoutYear !== slug) trySlugs.push(withoutYear)

  for (const candidate of trySlugs) {
    const staticEv = getEventBySlug(candidate) as EventPageRecord | undefined
    const dbEv = await fetchPublishedSupabaseEventAsPageEvent(candidate)

    if (dbEv?.c2kSourceId) {
      const merged: EventPageRecord = { ...dbEv }
      if (staticEv?.logo && !dbEv.logo) merged.logo = staticEv.logo
      if (staticEv?.location?.region && !dbEv.location.region) {
        merged.location = { ...merged.location, region: staticEv.location.region }
      }
      if (
        staticEv?.excerpt &&
        (!dbEv.excerpt ||
          dbEv.excerpt.length > 320 ||
          (dbEv.longDescription && dbEv.excerpt.startsWith(dbEv.longDescription.slice(0, 80))))
      ) {
        merged.excerpt = staticEv.excerpt
      }
      if (
        staticEv?.longDescription &&
        (!dbEv.longDescription ||
          dbEv.longDescription === dbEv.excerpt ||
          (staticEv.longDescription.length > (dbEv.longDescription?.length ?? 0) + 80 &&
            (dbEv.longDescription?.length ?? 0) < 400))
      ) {
        merged.longDescription = staticEv.longDescription
      }
      if (staticEv?.venue && !dbEv.venue) merged.venue = staticEv.venue
      return merged
    }
    if (preferDb && dbEv) return dbEv
    if (staticEv) return staticEv
    if (dbEv) return dbEv
  }
  return null
}

/**
 * Published event rows for sitemap (organizer-created and C2K ingest).
 */
export async function fetchPublishedEventSlugsForSitemap(): Promise<
  Array<{ slug: string; updated?: string }>
> {
  const client = getSupabaseServerClient() ?? getSupabaseClient()
  if (!client) {
    console.error('[sitemap] events: Supabase server client unavailable (check NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)')
    return []
  }
  try {
    const { data, error } = await client
      .from('events')
      .select('slug, start_date, last_synced_at, published_at, status')
      .eq('status', 'published')

    if (error) {
      console.error('[sitemap] events query failed:', error.message, error.code, error.details)
      return []
    }
    if (!data?.length) {
      console.warn('[sitemap] events query returned 0 published rows')
      return []
    }
    return (data as Record<string, unknown>[])
      .filter((row) => row.slug)
      .map((row) => ({
        slug: String(row.slug),
        updated: String(row.last_synced_at || row.published_at || row.start_date || '').slice(0, 10),
      }))
  } catch (err) {
    console.error('[sitemap] events unexpected error:', err)
    return []
  }
}

/** @deprecated Use fetchPublishedEventSlugsForSitemap — includes organizer events, not only C2K. */
export async function fetchPublishedC2kEventSlugsForSitemap() {
  return fetchPublishedEventSlugsForSitemap()
}

/** Draft/archived owner preview — never use this for anonymous public reads. */
export async function fetchOwnedEventAsPageEvent(
  slug: string,
  organizationId: string,
): Promise<EventPageRecord | null> {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data, error } = await admin
    .from('events')
    .select(EVENT_PAGE_COLUMNS)
    .eq('slug', slug)
    .eq('organization_id', organizationId)
    .maybeSingle()
  if (error || !data) return null
  return dbRowToEventPageRecord(data as unknown as Record<string, unknown>)
}

/** Shape for `/events` client list and paginated `EventCard` grids (static + Supabase). */
export function unifiedEventToEventsPageShape(e: UnifiedEvent) {
  const { city, state, region } = e.location
  const regionOut = region || (city && state ? `${city}, ${state}` : state || '')
  return {
    slug: e.slug,
    name: e.name,
    category: e.category,
    date: e.date,
    location: { city, state, region: regionOut },
    excerpt: e.excerpt,
    logo: e.logo,
  }
}
