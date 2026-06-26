import type { KinkSocialListingRecord } from '@/lib/unifiedExtendedListings'
import type { UnifiedEvent } from '@/lib/unifiedEvents'
import { unifiedToIndexItem } from '@/lib/publicEventIndex'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
export { PLACE_INTENT_OPTIONS } from '@/types/publicPlaceListing'
export type { PlaceListIntent } from '@/types/publicPlaceListing'

import type {
  PlaceListIntent,
  PublicPlaceListing,
  PublicPlaceRouteKind,
  PublicPlaceType,
  VenuePrivacyMode,
} from '@/types/publicPlaceListing'
import { PLACE_INTENT_OPTIONS } from '@/types/publicPlaceListing'
import type { PublicPlaceMedia } from '@/types/publicPlaceMedia'

type EckePlaceRecord = {
  name: string
  slug: string
  location: { city: string; state: string; address?: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string | null
  images?: string[]
  website?: string
  contact?: { phone?: string; email?: string }
  hours?: string
  byob?: string
  membership?: string
  socialMedia?: Record<string, string | undefined>
}

function inferPlaceType(category: string | undefined, routeKind: PublicPlaceRouteKind): PublicPlaceType {
  const text = (category ?? '').toLowerCase()
  if (routeKind === 'swing_club') return 'swing_lifestyle_club'
  if (/dungeon|bdsm|play space|fetish/i.test(text)) return 'dungeon'
  if (/education|workshop|class|creative arts|collective/i.test(text)) return 'education_space'
  if (/studio|photography/i.test(text)) return 'studio'
  if (/camp|campground|outdoor|retreat/i.test(text)) return 'campground'
  if (/retail|vendor|market/i.test(text)) return 'retail_and_events'
  if (/private club|members/i.test(text)) return 'private_club'
  if (/community|social club|501\(c\)/i.test(text)) return 'community_space'
  if (/venue|event/i.test(text)) return 'event_venue'
  return routeKind === 'dungeon' ? 'dungeon' : 'other'
}

function inferPrivacyMode(record: EckePlaceRecord): VenuePrivacyMode {
  if (record.location.address?.trim()) return 'public_address'
  if (/contact|rsvp|registration|private|members/i.test(record.excerpt ?? '')) return 'contact_for_location'
  return 'city_only'
}

function eckeImagesToGallery(record: EckePlaceRecord): PublicPlaceMedia[] {
  const urls = record.images ?? []
  return urls
    .filter(Boolean)
    .map((url, i) => ({
      id: `${record.slug}-img-${i}`,
      url,
      alt: `${record.name} — venue photo`,
      mediaKind: 'interior' as const,
      sourceSystem: 'ecke' as const,
      moderationStatus: 'approved' as const,
      containsPeople: false,
      consentCleared: true,
      publicSafe: true,
      sortOrder: i,
    }))
}

function inferNewFriendly(text: string): boolean {
  return /newcomer|new-friendly|first.?timer|first contact|beginner|101|gateway/i.test(text)
}

function inferMembership(text: string): boolean {
  return /members.?only|membership required|contributor|must apply|members only/i.test(text)
}

function extractPoliciesFromText(text: string): Partial<PublicPlaceListing> {
  const policies: Partial<PublicPlaceListing> = {}
  if (/alcohol.?free|no alcohol|byob/i.test(text)) {
    policies.alcoholPolicy = /byob/i.test(text) ? 'BYOB policy — confirm with venue' : 'Alcohol-free venue'
  }
  if (/photo(?:graphy)?.*not allowed|no photo|photography.*prohibited/i.test(text)) {
    policies.photographyPolicy = 'Photography restricted during events — confirm with venue'
  }
  if (/drug.?free|zero tolerance.*drug/i.test(text)) {
    policies.consentPolicySummary = 'Drug-free policy — confirm full house rules on official site'
  }
  if (/accessibility|ground floor|no steps|ada/i.test(text)) {
    policies.accessibilityNotes = 'Accessibility details mentioned — confirm with venue before visiting'
  }
  if (/parking/i.test(text)) {
    policies.parkingInfo = 'Parking information available — see full listing or official site'
  }
  if (/19\+|18\+|21\+|minimum age/i.test(text)) {
    policies.agePolicy = 'Age policy applies — confirm on official site'
  }
  return policies
}

function buildAmenities(record: EckePlaceRecord, placeType: PublicPlaceType): string[] {
  const text = `${record.excerpt ?? ''} ${record.description?.long ?? ''} ${record.category ?? ''}`.toLowerCase()
  const amenities: string[] = []
  if (placeType === 'dungeon' || /play space|dungeon/i.test(text)) amenities.push('Play space')
  if (/class|workshop|education|101/i.test(text)) amenities.push('Classes')
  if (/vendor|market/i.test(text)) amenities.push('Vendor nights')
  if (record.membership || /members/i.test(text)) amenities.push('Membership')
  if (/waiver|contributor/i.test(text)) amenities.push('Waivers')
  if (/parking/i.test(text)) amenities.push('Parking info')
  if (/accessibility|ground floor/i.test(text)) amenities.push('Accessibility notes')
  if (record.byob || /byob|alcohol/i.test(text)) amenities.push('Alcohol policy')
  if (/photo/i.test(text)) amenities.push('Photo policy')
  if (/dress code/i.test(text)) amenities.push('Dress code')
  if (record.hours) amenities.push('Hours posted')
  return amenities
}

export function dungeonToPlaceListing(record: EckePlaceRecord): PublicPlaceListing {
  const body = record.description?.long ?? record.excerpt ?? ''
  const placeType = inferPlaceType(record.category, 'dungeon')
  const policies = extractPoliciesFromText(body)
  const gallery = eckeImagesToGallery(record)

  return {
    id: record.slug,
    slug: record.slug,
    name: record.name,
    routeKind: 'dungeon',
    detailPath: `/dungeons/${record.slug}`,
    placeType,
    shortSummary: record.excerpt,
    description: record.description?.long ?? record.excerpt,
    city: record.location.city,
    state: record.location.state,
    venuePrivacyMode: inferPrivacyMode(record),
    publicAddress:
      inferPrivacyMode(record) === 'public_address' ? record.location.address : undefined,
    websiteUrl: record.website,
    contactEmail: record.contact?.email,
    contactPhone: record.contact?.phone,
    logoUrl: record.logo ?? undefined,
    coverImageUrl: gallery[0]?.url,
    gallery: gallery.length ? gallery : undefined,
    amenities: buildAmenities(record, placeType),
    membershipInfo: record.membership,
    hours: record.hours,
    categoryLabel: record.category,
    newFriendly: inferNewFriendly(body),
    membershipRequired: inferMembership(body),
    ...policies,
    sourceSystem: 'ecke',
    status: 'published',
  }
}

export function swingClubToPlaceListing(record: EckePlaceRecord): PublicPlaceListing {
  const base = dungeonToPlaceListing(record)
  return {
    ...base,
    routeKind: 'swing_club',
    detailPath: `/swing-clubs/${record.slug}`,
    placeType: 'swing_lifestyle_club',
    alcoholPolicy: record.byob ? `BYOB: ${record.byob}` : base.alcoholPolicy,
    membershipInfo: record.membership ?? base.membershipInfo,
  }
}

export function kinkSocialVenueToPlaceListing(record: KinkSocialListingRecord): PublicPlaceListing {
  const city = record.city ?? 'Location TBD'
  const state = record.state ?? ''
  return {
    id: record.c2kSourceId,
    slug: record.slug,
    name: record.name,
    routeKind: 'venue',
    detailPath: `/venues/${record.slug}`,
    placeType: 'event_venue',
    shortSummary: record.publicLocationSummary ?? record.description?.slice(0, 200) ?? undefined,
    description: record.description ?? undefined,
    city,
    state,
    venuePrivacyMode: record.publicLocationSummary ? 'approximate_area' : 'city_only',
    websiteUrl: record.websiteUrl ?? undefined,
    logoUrl: record.logoUrl ?? undefined,
    kinkSocialPlaceUrl: record.kinkSocialCanonicalUrl ?? undefined,
    kinkSocialOrganizationUrl: record.orgSlug
      ? undefined
      : undefined,
    followUrl: record.ctaUrl ?? record.kinkSocialCanonicalUrl ?? undefined,
    claimUrl: record.ctaUrl ?? undefined,
    organizerName: record.orgDisplayName ?? undefined,
    categoryLabel: 'kink.social venue',
    sourceSystem: 'kink_social',
    sourceId: record.c2kSourceId,
    sourceAttribution: record.sourceAttribution,
    lastSyncedAt: record.lastSyncedAt ?? undefined,
    status: 'published',
  }
}

/** kink.social wins on slug collision when fresher */
export function mergePlaceListings(items: PublicPlaceListing[]): PublicPlaceListing[] {
  const bySlug = new Map<string, PublicPlaceListing>()
  for (const item of items) {
    const existing = bySlug.get(item.slug)
    if (!existing) {
      bySlug.set(item.slug, item)
      continue
    }
    if (existing.sourceSystem === 'ecke' && item.sourceSystem === 'kink_social') {
      bySlug.set(item.slug, { ...existing, ...item, detailPath: item.detailPath })
    } else if (item.lastSyncedAt && existing.lastSyncedAt && item.lastSyncedAt > existing.lastSyncedAt) {
      bySlug.set(item.slug, { ...existing, ...item })
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function attachEventCounts(
  places: PublicPlaceListing[],
  events: PublicEventIndexItem[]
): PublicPlaceListing[] {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  return places.map((place) => {
    const matched = events.filter((e) => eventMatchesPlace(place, e))
    const thisMonth = matched.filter((e) => {
      const d = new Date(e.startsAt)
      return d.getMonth() === month && d.getFullYear() === year
    })
    return {
      ...place,
      upcomingEventCount: matched.length,
      upcomingEvents: matched.slice(0, 6),
    }
  })
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
}

export function eventMatchesPlace(place: PublicPlaceListing, event: PublicEventIndexItem): boolean {
  const placeNorm = normalizeName(place.name)
  const titleNorm = normalizeName(event.title)
  if (titleNorm.includes(placeNorm) || placeNorm.includes(titleNorm)) return true
  if (event.organizerName && normalizeName(event.organizerName).includes(placeNorm)) return true
  return false
}

export function buildPlaceIndex(
  dungeons: EckePlaceRecord[],
  swingClubs: EckePlaceRecord[],
  kinkSocialVenues: KinkSocialListingRecord[] = [],
  unifiedEvents: UnifiedEvent[] = []
): PublicPlaceListing[] {
  const eventItems = unifiedEvents.map(unifiedToIndexItem)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = eventItems.filter((e) => new Date(e.endsAt) >= today)

  const raw = [
    ...dungeons.map(dungeonToPlaceListing),
    ...swingClubs.map(swingClubToPlaceListing),
    ...kinkSocialVenues.map(kinkSocialVenueToPlaceListing),
  ]
  return attachEventCounts(mergePlaceListings(raw), upcoming)
}

export function matchesPlaceIntent(item: PublicPlaceListing, intent: PlaceListIntent): boolean {
  if (intent === 'all') return true
  if (intent === 'dungeons') return item.placeType === 'dungeon' || item.routeKind === 'dungeon'
  if (intent === 'swing-clubs') return item.placeType === 'swing_lifestyle_club'
  if (intent === 'education') return item.placeType === 'education_space'
  if (intent === 'studios') return item.placeType === 'studio'
  if (intent === 'retail') return item.placeType === 'retail_and_events'
  if (intent === 'campgrounds') return item.placeType === 'campground'
  if (intent === 'new-friendly') return item.newFriendly === true
  if (intent === 'public-address') return item.venuePrivacyMode === 'public_address'
  if (intent === 'events-this-month') return (item.upcomingEventCount ?? 0) > 0
  if (intent === 'kink-social') return item.sourceSystem === 'kink_social'
  return true
}

export function placeIntentCounts(items: PublicPlaceListing[]): Partial<Record<PlaceListIntent, number>> {
  const counts: Partial<Record<PlaceListIntent, number>> = {}
  for (const opt of PLACE_INTENT_OPTIONS) {
    if (opt.id === 'all') continue
    const n = items.filter((i) => matchesPlaceIntent(i, opt.id)).length
    if (n > 0) counts[opt.id] = n
  }
  return counts
}

export function placeTypeLabel(type: PublicPlaceType): string {
  switch (type) {
    case 'dungeon':
      return 'Dungeon'
    case 'swing_lifestyle_club':
      return 'Swing / lifestyle club'
    case 'education_space':
      return 'Education space'
    case 'community_space':
      return 'Community space'
    case 'studio':
      return 'Studio'
    case 'campground':
      return 'Campground'
    case 'retail_and_events':
      return 'Retail + events'
    case 'private_club':
      return 'Private club'
    case 'event_venue':
      return 'Event venue'
    default:
      return 'Venue'
  }
}

export function privacyModeLabel(mode: VenuePrivacyMode): string {
  switch (mode) {
    case 'public_address':
      return 'Public address'
    case 'city_only':
      return 'City listed'
    case 'approximate_area':
      return 'Approximate area'
    case 'hidden_until_registered':
      return 'Location after registration'
    case 'contact_for_location':
      return 'Contact for location'
    default:
      return 'Location info'
  }
}

export function featuredPlaceScore(item: PublicPlaceListing): number {
  let score = 0
  if (item.coverImageUrl || item.gallery?.length) score += 30
  if (item.logoUrl) score += 15
  if ((item.upcomingEventCount ?? 0) > 0) score += 25
  if (item.sourceSystem === 'kink_social') score += 10
  if (item.placeType === 'dungeon' || item.placeType === 'swing_lifestyle_club') score += 10
  if (item.websiteUrl) score += 5
  return score
}

export function pickFeaturedPlaces(items: PublicPlaceListing[], limit = 3): PublicPlaceListing[] {
  return [...items]
    .sort((a, b) => featuredPlaceScore(b) - featuredPlaceScore(a) || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function findEventsForPlaceListing(
  place: PublicPlaceListing,
  events: UnifiedEvent[]
): PublicEventIndexItem[] {
  const items = events.map(unifiedToIndexItem)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return items
    .filter((e) => new Date(e.endsAt) >= today && eventMatchesPlace(place, e))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 6)
}
