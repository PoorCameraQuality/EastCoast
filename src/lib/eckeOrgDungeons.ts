import { z } from 'zod'
import { getAllDungeons } from '@/data/dungeons'
import { isCitySlug } from '@/lib/discoveryCityRegistry'
import { requireOrgApiSession } from '@/lib/eckeOrgEvents'
import {
  ORG_PLACE_KINDS,
  ORG_PLACE_KIND_CATEGORY,
  RESERVED_PLACE_SLUGS,
  buildPlaceSeoDescription,
  buildPlaceSeoKeywords,
  buildPlaceSeoTitle,
  normalizePlaceHubTags,
  slugifyPlaceSlug,
  type ManagedPlaceRow,
  type OrgPlaceInput,
  type OrgPlaceKind,
} from '@/lib/eckeOrgDungeonShared'
import { notifyDungeonDiscovery } from '@/lib/eckeDungeonDiscovery'
import type { UnifiedDungeon } from '@/lib/unifiedDungeons'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { sanitizeOrgHtml } from '@/lib/eckeOrgRichText'

export { requireOrgApiSession }
export type { ManagedPlaceRow, OrgPlaceInput, OrgPlaceKind }

export const MANAGED_PLACE_SELECT = [
  'id',
  'slug',
  'name',
  'description',
  'short_description',
  'website_url',
  'contact_email',
  'contact_phone',
  'city',
  'state',
  'street_address',
  'private_address',
  'hours',
  'category',
  'kind',
  'logo_url',
  'cover_url',
  'gallery_urls',
  'age_restriction',
  'accessibility',
  'dress_code',
  'photography_policy',
  'parking',
  'house_rules',
  'alcohol_policy',
  'membership_info',
  'first_timer_info',
  'seo_hub_tags',
  'status',
  'organization_id',
  'published_at',
  'updated_at',
  'meta_title',
  'meta_description',
].join(', ')

function optionalUrl(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim()
  if (!raw) return undefined
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

function sanitizePlaceHtml(input: string): string {
  return sanitizeOrgHtml(input).replace(/javascript:/gi, '')
}

export const orgPlaceSchema = z
  .object({
    name: z.string().min(3).max(120),
    slug: z.string().max(80).optional().or(z.literal('')),
    kind: z.enum(ORG_PLACE_KINDS).optional(),
    shortDescription: z.string().min(10).max(280),
    longDescription: z.string().min(10).max(20000),
    website: z.string().max(500).optional().or(z.literal('')),
    contactEmail: z.string().email('Enter a contact email visitors can write to'),
    contactPhone: z.string().max(40).optional().or(z.literal('')),
    city: z.string().max(80).optional().or(z.literal('')),
    state: z.string().max(2).optional().or(z.literal('')),
    address: z.string().max(200).optional().or(z.literal('')),
    showAddressPublicly: z.boolean().optional(),
    hours: z.string().max(500).optional().or(z.literal('')),
    hubTags: z.array(z.string().max(40)).max(7).optional(),
    ageRestriction: z.string().max(20).optional().or(z.literal('')),
    accessibility: z.string().max(2000).optional().or(z.literal('')),
    dressCode: z.string().max(2000).optional().or(z.literal('')),
    photographyPolicy: z.string().max(2000).optional().or(z.literal('')),
    parking: z.string().max(2000).optional().or(z.literal('')),
    houseRules: z.string().max(4000).optional().or(z.literal('')),
    alcoholPolicy: z.string().max(2000).optional().or(z.literal('')),
    membershipInfo: z.string().max(2000).optional().or(z.literal('')),
    firstTimerInfo: z.string().max(2000).optional().or(z.literal('')),
    status: z.enum(['draft', 'published']).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.city?.trim()) ctx.addIssue({ code: 'custom', path: ['city'], message: 'City is required' })
    if (!value.state?.trim() || value.state.trim().length !== 2) {
      ctx.addIssue({ code: 'custom', path: ['state'], message: 'State is required' })
    }
  })

export async function requireOwnedPlace() {
  const gated = await requireOrgApiSession()
  if (gated.error || !gated.session || !gated.admin) return { ...gated, place: null }
  const { data } = await gated.admin
    .from('dungeon_venues')
    .select(MANAGED_PLACE_SELECT)
    .eq('organization_id', gated.session.organization.id)
    .maybeSingle()
  return { ...gated, place: (data as ManagedPlaceRow | null) || null }
}

export async function takeRequestedPlaceSlug(raw: string, excludeId?: string) {
  const root = slugifyPlaceSlug(raw)
  if (root.length < 3) return { error: 'Slug needs at least 3 letters or numbers' }
  if (RESERVED_PLACE_SLUGS.has(root) || isCitySlug(root)) {
    return { error: 'That URL is reserved. Try another slug.' }
  }
  const staticHit = getAllDungeons().some((dungeon: { slug?: string }) => dungeon.slug === root)
  if (staticHit) return { error: 'That URL is already in use. Choose another slug.' }
  const admin = getSupabaseAdminClient()
  if (!admin) return { slug: root }
  let query = admin.from('dungeon_venues').select('id').eq('slug', root)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.maybeSingle()
  if (data) return { error: 'That URL is already in use. Choose another slug.' }
  return { slug: root }
}

export async function uniquePlaceSlug(name: string, excludeId?: string) {
  const root = slugifyPlaceSlug(name) || 'place'
  const safeRoot = RESERVED_PLACE_SLUGS.has(root) || isCitySlug(root) ? `${root}-place` : root
  const resolved = await takeRequestedPlaceSlug(safeRoot, excludeId)
  if (!('error' in resolved)) return resolved.slug
  for (let i = 2; i < 10; i += 1) {
    const next = await takeRequestedPlaceSlug(`${safeRoot}-${i}`, excludeId)
    if (!('error' in next)) return next.slug
  }
  return `${safeRoot}-${Date.now().toString(36)}`
}

export function placeWritePayload(input: OrgPlaceInput, orgId: string, slug: string) {
  const status = input.status === 'draft' ? 'draft' : 'published'
  const kind = input.kind && ORG_PLACE_KINDS.includes(input.kind) ? input.kind : 'dungeon'
  const hubTags = normalizePlaceHubTags(input.hubTags)
  const city = input.city!.trim()
  const state = input.state!.trim().toUpperCase()
  const address = input.address?.trim() || ''
  const showPublic = Boolean(input.showAddressPublicly) && Boolean(address)
  const seoTitle = buildPlaceSeoTitle({ name: input.name.trim(), city, state })
  const seoDescription = buildPlaceSeoDescription(input.shortDescription)
  return {
    name: input.name.trim(),
    slug,
    kind,
    category: ORG_PLACE_KIND_CATEGORY[kind],
    description: sanitizePlaceHtml(input.longDescription.trim()),
    short_description: input.shortDescription.trim(),
    website_url: optionalUrl(input.website) ?? null,
    contact_email: input.contactEmail!.trim().toLowerCase(),
    contact_phone: input.contactPhone?.trim() || null,
    city,
    state,
    street_address: address || null,
    private_address: !showPublic,
    hours: input.hours?.trim() || null,
    seo_hub_tags: hubTags,
    age_restriction: input.ageRestriction?.trim() || null,
    accessibility: input.accessibility?.trim() || null,
    dress_code: input.dressCode?.trim() || null,
    photography_policy: input.photographyPolicy?.trim() || null,
    parking: input.parking?.trim() || null,
    house_rules: input.houseRules?.trim() || null,
    alcohol_policy: input.alcoholPolicy?.trim() || null,
    membership_info: input.membershipInfo?.trim() || null,
    first_timer_info: input.firstTimerInfo?.trim() || null,
    organization_id: orgId,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
    meta_title: seoTitle,
    meta_description: seoDescription,
    source_attribution: 'ecke-org',
  }
}

export function notifyPlaceIndex(
  place: Pick<ManagedPlaceRow, 'slug' | 'state' | 'seo_hub_tags'>,
  reason: 'publish' | 'update' | 'unpublish' | 'archive' | 'delete' = 'publish',
) {
  notifyDungeonDiscovery({
    slug: place.slug,
    stateAbbr: place.state,
    seoHubTags: place.seo_hub_tags || [],
    reason,
  })
}

export function placeToUnified(place: ManagedPlaceRow): UnifiedDungeon {
  const city = place.city?.trim() || ''
  const state = place.state ? String(place.state).toUpperCase().slice(0, 2) : ''
  const shortPitch = place.short_description?.trim() || place.meta_description?.trim() || ''
  const longBody = place.description?.trim() || ''
  const showAddress = !place.private_address && Boolean(place.street_address)
  const gallery = (place.gallery_urls || []).filter(Boolean)
  const hubTags = normalizePlaceHubTags(place.seo_hub_tags || [])
  const record = {
    name: place.name,
    slug: place.slug,
    location: {
      city,
      state,
      address: showAddress ? place.street_address || '' : '',
    },
    category: place.category || ORG_PLACE_KIND_CATEGORY[place.kind || 'dungeon'],
    excerpt: shortPitch,
    description: { long: longBody },
    website: place.website_url || undefined,
    logo: place.logo_url || place.cover_url || undefined,
    images: gallery,
    hours: place.hours || undefined,
    contact: {
      email: place.contact_email || undefined,
      phone: place.contact_phone || undefined,
    },
    seo: {
      title: place.meta_title || buildPlaceSeoTitle({ name: place.name, city, state }),
      description: place.meta_description || buildPlaceSeoDescription(shortPitch || longBody),
      keywords: buildPlaceSeoKeywords({
        name: place.name,
        city,
        state,
        kind: place.kind,
        hubTags: hubTags,
      }).join(', '),
    },
    coverUrl: place.cover_url || undefined,
    ageRestriction: place.age_restriction || undefined,
    accessibility: place.accessibility || undefined,
    dressCode: place.dress_code || undefined,
    photographyPolicy: place.photography_policy || undefined,
    parking: place.parking || undefined,
    houseRules: place.house_rules || undefined,
    alcoholPolicy: place.alcohol_policy || undefined,
    membershipInfo: place.membership_info || undefined,
    firstTimerInfo: place.first_timer_info || undefined,
    venueId: place.id,
    organizationId: place.organization_id,
    status: place.status === 'draft' ? 'draft' : 'published',
    discoveryTagSlugs: hubTags,
    c2kSourceId: null,
    c2kSourceType: null,
  }
  return record as UnifiedDungeon
}

export async function fetchOwnedPlaceAsUnified(slug: string, organizationId: string): Promise<UnifiedDungeon | null> {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from('dungeon_venues')
    .select(MANAGED_PLACE_SELECT)
    .eq('slug', slug)
    .eq('organization_id', organizationId)
    .maybeSingle()
  if (!data) return null
  return placeToUnified(data as unknown as ManagedPlaceRow)
}
