export const ORG_EVENT_KINDS = [
  'party',
  'convention',
  'munch',
  'educational',
  'social',
  'play_event',
  'retreat',
  'fundraiser',
  'other',
] as const

export type OrgEventKind = (typeof ORG_EVENT_KINDS)[number]

export const ORG_EVENT_KIND_LABELS: Record<OrgEventKind, string> = {
  party: 'Party',
  convention: 'Convention',
  munch: 'Munch',
  educational: 'Educational',
  social: 'Social',
  play_event: 'Play event',
  retreat: 'Retreat',
  fundraiser: 'Fundraiser',
  other: 'Other',
}

/** Values allowed by public.events.events_event_type_check (discovery schema). */
export const DB_EVENT_TYPES = ['munch', 'play_party', 'class', 'convention', 'social'] as const
export type DbEventType = (typeof DB_EVENT_TYPES)[number]

export function orgKindToDbEventType(kind: OrgEventKind): DbEventType {
  switch (kind) {
    case 'convention':
    case 'retreat':
      return 'convention'
    case 'munch':
      return 'munch'
    case 'educational':
      return 'class'
    case 'play_event':
    case 'party':
      return 'play_party'
    default:
      return 'social'
  }
}

export function dbEventTypeToOrgKind(eventType: string | null | undefined): OrgEventKind {
  switch (eventType) {
    case 'play_party':
      return 'play_event'
    case 'class':
      return 'educational'
    case 'convention':
      return 'convention'
    case 'munch':
      return 'munch'
    case 'social':
      return 'social'
    default:
      if (eventType && (ORG_EVENT_KINDS as readonly string[]).includes(eventType)) {
        return eventType as OrgEventKind
      }
      return 'other'
  }
}

/** Short Bing/schema keywords from structured fields — not a freeform organizer box. */
export function buildEventSeoKeywords(input: {
  title: string
  city?: string
  state?: string
  kind?: OrgEventKind
  isOnline?: boolean
}): string[] {
  const city = input.isOnline ? 'Online' : input.city?.trim()
  const state = input.isOnline ? undefined : input.state?.trim().toUpperCase()
  const seen = new Set<string>()
  const terms: string[] = []
  for (const raw of [
    input.title.trim(),
    city,
    state,
    input.kind ? ORG_EVENT_KIND_LABELS[input.kind] : undefined,
    'kink events',
    'BDSM',
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

export function buildEventSeoTitle(input: {
  title: string
  city?: string
  state?: string
  startDate?: string
  isOnline?: boolean
}): string {
  const year = input.startDate ? String(new Date(`${input.startDate}T00:00:00`).getFullYear()) : ''
  const city = input.isOnline ? 'Online' : input.city?.trim()
  const state = input.isOnline ? undefined : input.state?.trim().toUpperCase()
  const location = city && state ? ` — ${city}, ${state}` : city ? ` — ${city}` : ''
  const nameHasYear = year && new RegExp(`\\b${year}\\b`).test(input.title)
  const yearPart = year && !nameHasYear ? ` (${year})` : ''
  let title = `${input.title.trim()}${location}${yearPart}`
  if (title.length > 60) title = `${input.title.trim()}${location}`
  if (title.length > 60) title = input.title.trim()
  return title.slice(0, 60)
}

export const STATE_ABBR_OPTIONS = [
  { abbr: 'AL', name: 'Alabama', group: 'us' },
  { abbr: 'AK', name: 'Alaska', group: 'us' },
  { abbr: 'AZ', name: 'Arizona', group: 'us' },
  { abbr: 'AR', name: 'Arkansas', group: 'us' },
  { abbr: 'CA', name: 'California', group: 'us' },
  { abbr: 'CO', name: 'Colorado', group: 'us' },
  { abbr: 'CT', name: 'Connecticut', group: 'us' },
  { abbr: 'DE', name: 'Delaware', group: 'us' },
  { abbr: 'DC', name: 'Washington DC', group: 'us' },
  { abbr: 'FL', name: 'Florida', group: 'us' },
  { abbr: 'GA', name: 'Georgia', group: 'us' },
  { abbr: 'HI', name: 'Hawaii', group: 'us' },
  { abbr: 'ID', name: 'Idaho', group: 'us' },
  { abbr: 'IL', name: 'Illinois', group: 'us' },
  { abbr: 'IN', name: 'Indiana', group: 'us' },
  { abbr: 'IA', name: 'Iowa', group: 'us' },
  { abbr: 'KS', name: 'Kansas', group: 'us' },
  { abbr: 'KY', name: 'Kentucky', group: 'us' },
  { abbr: 'LA', name: 'Louisiana', group: 'us' },
  { abbr: 'ME', name: 'Maine', group: 'us' },
  { abbr: 'MD', name: 'Maryland', group: 'us' },
  { abbr: 'MA', name: 'Massachusetts', group: 'us' },
  { abbr: 'MI', name: 'Michigan', group: 'us' },
  { abbr: 'MN', name: 'Minnesota', group: 'us' },
  { abbr: 'MS', name: 'Mississippi', group: 'us' },
  { abbr: 'MO', name: 'Missouri', group: 'us' },
  { abbr: 'MT', name: 'Montana', group: 'us' },
  { abbr: 'NE', name: 'Nebraska', group: 'us' },
  { abbr: 'NV', name: 'Nevada', group: 'us' },
  { abbr: 'NH', name: 'New Hampshire', group: 'us' },
  { abbr: 'NJ', name: 'New Jersey', group: 'us' },
  { abbr: 'NM', name: 'New Mexico', group: 'us' },
  { abbr: 'NY', name: 'New York', group: 'us' },
  { abbr: 'NC', name: 'North Carolina', group: 'us' },
  { abbr: 'ND', name: 'North Dakota', group: 'us' },
  { abbr: 'OH', name: 'Ohio', group: 'us' },
  { abbr: 'OK', name: 'Oklahoma', group: 'us' },
  { abbr: 'OR', name: 'Oregon', group: 'us' },
  { abbr: 'PA', name: 'Pennsylvania', group: 'us' },
  { abbr: 'RI', name: 'Rhode Island', group: 'us' },
  { abbr: 'SC', name: 'South Carolina', group: 'us' },
  { abbr: 'SD', name: 'South Dakota', group: 'us' },
  { abbr: 'TN', name: 'Tennessee', group: 'us' },
  { abbr: 'TX', name: 'Texas', group: 'us' },
  { abbr: 'UT', name: 'Utah', group: 'us' },
  { abbr: 'VT', name: 'Vermont', group: 'us' },
  { abbr: 'VA', name: 'Virginia', group: 'us' },
  { abbr: 'WA', name: 'Washington', group: 'us' },
  { abbr: 'WV', name: 'West Virginia', group: 'us' },
  { abbr: 'WI', name: 'Wisconsin', group: 'us' },
  { abbr: 'WY', name: 'Wyoming', group: 'us' },
  { abbr: 'AB', name: 'Alberta', group: 'canada' },
  { abbr: 'BC', name: 'British Columbia', group: 'canada' },
  { abbr: 'MB', name: 'Manitoba', group: 'canada' },
  { abbr: 'NB', name: 'New Brunswick', group: 'canada' },
  { abbr: 'NL', name: 'Newfoundland and Labrador', group: 'canada' },
  { abbr: 'NT', name: 'Northwest Territories', group: 'canada' },
  { abbr: 'NS', name: 'Nova Scotia', group: 'canada' },
  { abbr: 'NU', name: 'Nunavut', group: 'canada' },
  { abbr: 'ON', name: 'Ontario', group: 'canada' },
  { abbr: 'PE', name: 'Prince Edward Island', group: 'canada' },
  { abbr: 'QC', name: 'Quebec', group: 'canada' },
  { abbr: 'SK', name: 'Saskatchewan', group: 'canada' },
  { abbr: 'YT', name: 'Yukon', group: 'canada' },
] as const

export const US_STATE_ABBR_OPTIONS = STATE_ABBR_OPTIONS.filter((state) => state.group === 'us')
export const CANADA_STATE_ABBR_OPTIONS = STATE_ABBR_OPTIONS.filter((state) => state.group === 'canada')

export type EventTicketTier = {
  label?: string
  startsOn: string
  endsOn: string
  price: string
}

export function emptyTicketTier(): EventTicketTier {
  return { label: '', startsOn: '', endsOn: '', price: '' }
}

export function normalizeTicketTiers(raw: unknown): EventTicketTier[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const startsOn = String(row.startsOn || row.starts_on || '').slice(0, 10)
    const endsOn = String(row.endsOn || row.ends_on || '').slice(0, 10)
    const price = String(row.price || '').trim()
    if (!startsOn || !endsOn || !price) return []
    return [{ label: String(row.label || '').trim(), startsOn, endsOn, price }]
  })
}

export function todayIsoDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function ticketSalesClosed(deadline?: string | null, today = todayIsoDate()) {
  return Boolean(deadline && deadline < today)
}

export function currentTicketTier(tiers: EventTicketTier[], today = todayIsoDate()) {
  return tiers.find((tier) => tier.startsOn <= today && today <= tier.endsOn) || null
}

export function formatTierDates(tier: Pick<EventTicketTier, 'startsOn' | 'endsOn'>) {
  const start = new Date(`${tier.startsOn}T00:00:00`)
  const end = new Date(`${tier.endsOn}T00:00:00`)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (tier.startsOn === tier.endsOn) return start.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  const startLabel = start.toLocaleDateString('en-US', start.getFullYear() === end.getFullYear() ? opts : { ...opts, year: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

export function priceRangeFromTiers(tiers: EventTicketTier[]) {
  const prices = Array.from(new Set(tiers.map((tier) => tier.price).filter(Boolean)))
  if (prices.length === 0) return ''
  if (prices.length === 1) return prices[0]
  return `${prices[0]} – ${prices[prices.length - 1]}`
}

export function slugifyEventSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export type OrgEventInput = {
  title: string
  slug?: string
  shortDescription: string
  kind: OrgEventKind
  organizer?: string
  website?: string
  startDate: string
  startTime?: string
  endDate: string
  endTime?: string
  doorsOpen?: string
  isOnline?: boolean
  venue?: string
  city?: string
  state?: string
  address?: string
  showAddressPublicly?: boolean
  longDescription: string
  coverImage?: string
  gallery?: string
  ticketUrl?: string
  registrationRequired?: boolean
  ticketPrice?: string
  priceRange?: string
  registrationDeadline?: string
  ticketTiers?: EventTicketTier[]
  ageRestriction?: string
  accessibility?: string
  dressCode?: string
  photographyPolicy?: string
  parking?: string
  hotelInformation?: string
  foodDrink?: string
  vendorArea?: string
  /** Newline-separated highlight tiles on the public event page. */
  features?: string
  /** Newline-separated Why go cards. Stored in events.includes. */
  whyGo?: string
  status?: 'draft' | 'published'
  hostAtPlace?: boolean
}

export function parseOrganizerLines(raw: string | null | undefined, limit = 12): string[] {
  return String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, limit)
}

export function serializeOrganizerLines(lines: string[]): string {
  return lines.map((line) => line.trim()).filter(Boolean).join('\n')
}

export type OrgEventHostPlace = {
  id: string
  name: string
  slug: string
  city: string
  state: string
  address?: string
  showAddressPublicly?: boolean
}

export type OwnedPlaceLink = {
  id: string
  slug: string
  name: string
  city: string | null
  state: string | null
  street_address: string | null
  private_address: boolean | null
}

export function applyPlaceLinkToEventInput(
  input: OrgEventInput,
  place: OwnedPlaceLink | null,
  hostAtPlace: boolean,
) {
  if (!hostAtPlace || !place || input.isOnline) {
    return { input, placeLink: { dungeon_venue_id: null as string | null, dungeon_slug: null as string | null } }
  }
  const next = { ...input }
  if (!next.venue?.trim()) next.venue = place.name
  if (!next.city?.trim()) next.city = place.city || ''
  if (!next.state?.trim()) next.state = (place.state || '').toUpperCase().slice(0, 2)
  if (!next.address?.trim() && place.private_address === false && place.street_address) {
    next.address = place.street_address
    next.showAddressPublicly = true
  }
  return {
    input: next,
    placeLink: { dungeon_venue_id: place.id, dungeon_slug: place.slug },
  }
}

export type ManagedEventRow = {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  doors_open: string | null
  city: string
  state: string
  venue: string | null
  address: string | null
  show_address_publicly: boolean
  is_online: boolean
  category: string | null
  event_type: string | null
  short_description: string | null
  long_description: string | null
  website: string | null
  logo: string | null
  hero_image: string | null
  images: string[] | null
  program_url: string | null
  map_url: string | null
  staff_application_url: string | null
  vendor_application_url: string | null
  presenter_application_url: string | null
  photographer_application_url: string | null
  staff_applications_open: boolean
  vendor_applications_open: boolean
  presenter_applications_open: boolean
  photographer_applications_open: boolean
  ticket_url: string | null
  registration_required: boolean
  ticket_price: string | null
  price_range: string | null
  registration_deadline: string | null
  ticket_tiers: EventTicketTier[] | null
  age_restriction: string | null
  accessibility: string | null
  dress_code: string | null
  photography_policy: string | null
  parking: string | null
  hotel_information: string | null
  food_drink: string | null
  vendor_area: string | null
  features: string | string[] | null
  includes: string | null
  organizer_name: string | null
  status: string | null
  views: number
  archived_at: string | null
  organization_id: string | null
  dungeon_venue_id: string | null
  dungeon_slug: string | null
  post_count?: number
}

export function publicEventLifecycle(event: Pick<ManagedEventRow, 'status' | 'end_date' | 'archived_at'>) {
  if (event.archived_at || event.status === 'archived') return 'archived'
  if (event.status === 'draft') return 'draft'
  if (event.end_date && new Date(`${event.end_date}T23:59:59`) < new Date()) return 'past'
  return 'published'
}
