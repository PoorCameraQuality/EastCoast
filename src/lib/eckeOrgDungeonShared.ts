import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { slugifyEventSlug } from '@/lib/eckeOrgEventShared'
import { DUNGEON_SEO_HUB_TAG_SLUGS, type DungeonSeoHubTagSlug } from '@/lib/dungeonHubTagMap'

export { slugifyEventSlug as slugifyPlaceSlug }
export { US_STATE_ABBR_OPTIONS, CANADA_STATE_ABBR_OPTIONS } from '@/lib/eckeOrgEventShared'
export { DUNGEON_SEO_HUB_TAG_SLUGS, DUNGEON_SEO_HUB_LABELS } from '@/lib/dungeonHubTagMap'

export const ORG_PLACE_KINDS = ['dungeon', 'club', 'play_space', 'social_club', 'studio', 'other'] as const
export type OrgPlaceKind = (typeof ORG_PLACE_KINDS)[number]

export const ORG_PLACE_KIND_LABELS: Record<OrgPlaceKind, string> = {
  dungeon: 'Dungeon',
  club: 'Club',
  play_space: 'Play space',
  social_club: 'Social club',
  studio: 'Studio',
  other: 'Other',
}

export const ORG_PLACE_KIND_CATEGORY: Record<OrgPlaceKind, string> = {
  dungeon: 'BDSM Dungeon',
  club: 'Club',
  play_space: 'Play space',
  social_club: 'Social club',
  studio: 'Studio',
  other: 'Venue',
}

export const PLACE_HUB_TAG_OPTIONS = [
  { slug: 'private', label: 'Private / vetted' },
  { slug: 'public', label: 'Public / newcomer-friendly' },
  { slug: 'members-only', label: 'Members only' },
  { slug: 'rope-friendly', label: 'Rope-friendly' },
  { slug: 'impact-play', label: 'Impact play' },
  { slug: 'classes', label: 'Classes / workshops' },
] as const

export const RESERVED_PLACE_SLUGS = new Set<string>([
  'login',
  'my-place',
  'create',
  'page',
  'submit',
  ...Object.keys(EAST_COAST_STATES),
  ...DUNGEON_SEO_HUB_TAG_SLUGS,
])

export type PlaceStatus = 'draft' | 'published'

export type OrgPlaceInput = {
  name: string
  slug?: string
  kind?: OrgPlaceKind
  shortDescription: string
  longDescription: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  city?: string
  state?: string
  address?: string
  showAddressPublicly?: boolean
  hours?: string
  hubTags?: string[]
  ageRestriction?: string
  accessibility?: string
  dressCode?: string
  photographyPolicy?: string
  parking?: string
  houseRules?: string
  alcoholPolicy?: string
  membershipInfo?: string
  firstTimerInfo?: string
  status?: PlaceStatus
}

export type ManagedPlaceRow = {
  id: string
  slug: string
  name: string
  description: string | null
  short_description: string | null
  website_url: string | null
  contact_email: string | null
  contact_phone: string | null
  city: string | null
  state: string | null
  street_address: string | null
  private_address: boolean
  hours: string | null
  category: string | null
  kind: OrgPlaceKind
  logo_url: string | null
  cover_url: string | null
  gallery_urls: string[] | null
  age_restriction: string | null
  accessibility: string | null
  dress_code: string | null
  photography_policy: string | null
  parking: string | null
  house_rules: string | null
  alcohol_policy: string | null
  membership_info: string | null
  first_timer_info: string | null
  seo_hub_tags: string[] | null
  status: PlaceStatus
  organization_id: string | null
  published_at: string | null
  updated_at: string | null
  meta_title: string | null
  meta_description: string | null
}

export function isPlaceHubTag(value: string): value is DungeonSeoHubTagSlug {
  return (DUNGEON_SEO_HUB_TAG_SLUGS as readonly string[]).includes(value)
}

export function normalizePlaceHubTags(values: string[] | undefined): DungeonSeoHubTagSlug[] {
  const seen = new Set<DungeonSeoHubTagSlug>()
  for (const raw of values || []) {
    const slug = String(raw || '').trim().toLowerCase()
    if (isPlaceHubTag(slug)) seen.add(slug)
  }
  return Array.from(seen)
}

export function buildPlaceSeoKeywords(input: {
  name: string
  city?: string
  state?: string
  kind?: OrgPlaceKind
  hubTags?: string[]
}): string[] {
  const seen = new Set<string>()
  const terms: string[] = []
  for (const raw of [
    input.name.trim(),
    input.city?.trim(),
    input.state?.trim().toUpperCase(),
    input.kind ? ORG_PLACE_KIND_LABELS[input.kind] : undefined,
    ...(input.hubTags || []),
    'kink dungeon',
    'BDSM club',
  ]) {
    const term = raw?.trim()
    if (!term) continue
    const key = term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    terms.push(term)
  }
  return terms
}

export function buildPlaceSeoTitle(input: { name: string; city?: string; state?: string }): string {
  const city = input.city?.trim()
  const state = input.state?.trim().toUpperCase()
  const location = city && state ? ` — ${city}, ${state}` : city ? ` — ${city}` : ''
  let title = `${input.name.trim()}${location}`
  if (title.length > 60) title = input.name.trim()
  return title.slice(0, 60)
}

export function buildPlaceSeoDescription(shortDescription: string): string {
  return shortDescription.trim().slice(0, 160)
}

export function placeContactMailto(email: string, placeName: string): string {
  const subject = encodeURIComponent(`Question for ${placeName} (via East Coast Kink Events)`)
  return `mailto:${email}?subject=${subject}`
}

export function managedPlaceToFormValues(place: ManagedPlaceRow): OrgPlaceInput {
  return {
    name: place.name,
    slug: place.slug,
    kind: place.kind || 'dungeon',
    shortDescription: place.short_description || '',
    longDescription: place.description || '',
    website: place.website_url || '',
    contactEmail: place.contact_email || '',
    contactPhone: place.contact_phone || '',
    city: place.city || '',
    state: place.state || '',
    address: place.street_address || '',
    showAddressPublicly: !place.private_address && Boolean(place.street_address),
    hours: place.hours || '',
    hubTags: normalizePlaceHubTags(place.seo_hub_tags || []),
    ageRestriction: place.age_restriction || '',
    accessibility: place.accessibility || '',
    dressCode: place.dress_code || '',
    photographyPolicy: place.photography_policy || '',
    parking: place.parking || '',
    houseRules: place.house_rules || '',
    alcoholPolicy: place.alcohol_policy || '',
    membershipInfo: place.membership_info || '',
    firstTimerInfo: place.first_timer_info || '',
    status: place.status === 'draft' ? 'draft' : 'published',
  }
}

export function toOrgEventHostPlace(place: ManagedPlaceRow) {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    city: place.city || '',
    state: (place.state || '').toUpperCase().slice(0, 2),
    address: place.street_address || '',
    showAddressPublicly: !place.private_address && Boolean(place.street_address),
  }
}
