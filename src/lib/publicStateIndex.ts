import { getAllDungeons } from '@/data/dungeons'
import { getAllSwingClubs } from '@/data/swingClubs'
import { tagsBySlug } from '@/data/vendorTaxonomy'
import { getPublishedEducationArticles } from '@/lib/educationArticles'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { buildEducationIndex, splitByLane } from '@/lib/publicEducationIndex'
import { buildIndexFromUnified, splitUpcomingPast } from '@/lib/publicEventIndex'
import { buildPlaceIndex, mergePlaceListings } from '@/lib/publicPlaceIndex'
import { buildVendorIndex } from '@/lib/publicVendorIndex'
import { getUnifiedEvents } from '@/lib/unifiedEvents'
import { getUnifiedVendors } from '@/lib/unifiedVendors'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import type { PublicEducationItem } from '@/types/publicEducationItem'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'
import type { PublicRegionalListing } from '@/types/publicRegionalListing'
import type { PublicVendorListing } from '@/types/publicVendorListing'

export type StateHubStats = {
  events: number
  conventions: number
  places: number
  vendors: number
  education: number
  total: number
}

export type StateHubSummary = {
  slug: StateSlug
  info: (typeof EAST_COAST_STATES)[StateSlug]
  stats: StateHubStats
}

export type StateHubDetail = {
  slug: StateSlug
  info: (typeof EAST_COAST_STATES)[StateSlug]
  stats: StateHubStats
  events: PublicEventIndexItem[]
  conventions: PublicEventIndexItem[]
  places: PublicPlaceListing[]
  vendors: PublicVendorListing[]
  education: PublicEducationItem[]
  calendarPreview: PublicEventIndexItem[]
  recentlyUpdated: PublicRegionalListing[]
}

export type StateHubContext = {
  eventItems: PublicEventIndexItem[]
  places: PublicPlaceListing[]
  vendorListings: PublicVendorListing[]
  educationLibrary: PublicEducationItem[]
  nationwideEvents: PublicEventIndexItem[]
  nationwideVendors: PublicVendorListing[]
  recentlyUpdated: PublicRegionalListing[]
  summaries: StateHubSummary[]
}

function dedupeBySlug<T extends { slug: string; name: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  items.forEach((item) => map.set(item.slug, item))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function isOnlineEvent(item: PublicEventIndexItem): boolean {
  return item.eventType === 'online' || /online|virtual|zoom/i.test(`${item.title} ${item.summary ?? ''}`)
}

function isNationwideEvent(item: PublicEventIndexItem): boolean {
  return (
    isOnlineEvent(item) ||
    !item.state?.trim() ||
    /nationwide|multi-state|multi state|national/i.test(`${item.title} ${item.summary ?? ''}`)
  )
}

function eventsForState(items: PublicEventIndexItem[], abbr: string): PublicEventIndexItem[] {
  const { upcoming } = splitUpcomingPast(items)
  return upcoming.filter((e) => e.state === abbr)
}

function placesForState(places: PublicPlaceListing[], abbr: string): PublicPlaceListing[] {
  return places.filter((p) => p.state === abbr)
}

function vendorsForState(vendors: PublicVendorListing[], abbr: string): PublicVendorListing[] {
  const inState = vendors.filter((v) => v.state === abbr)
  const online = vendors.filter((v) => v.onlineOnly && v.state !== abbr).slice(0, 3)
  const seen = new Set<string>()
  const combined: PublicVendorListing[] = []
  for (const v of [...inState, ...online]) {
    if (seen.has(v.slug)) continue
    seen.add(v.slug)
    combined.push(v)
  }
  return combined.slice(0, 12)
}

function educationForState(
  library: PublicEducationItem[],
  abbr: string
): PublicEducationItem[] {
  const stateTagged = library.filter((item) =>
    item.tags?.some((t) => t.toLowerCase().includes(abbr.toLowerCase()))
  )
  if (stateTagged.length >= 2) return stateTagged.slice(0, 6)
  return library
    .filter((item) => item.featured || item.topic === 'beginner' || item.topic === 'community')
    .slice(0, 6)
}

function computeStats(
  events: PublicEventIndexItem[],
  places: PublicPlaceListing[],
  vendors: PublicVendorListing[],
  education: PublicEducationItem[]
): StateHubStats {
  const conventions = events.filter((e) => e.listingKind === 'convention').length
  const regularEvents = events.length - conventions
  return {
    events: regularEvents,
    conventions,
    places: places.length,
    vendors: vendors.length,
    education: education.length,
    total: events.length + places.length + vendors.length,
  }
}

function eventToRegional(item: PublicEventIndexItem): PublicRegionalListing {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    listingType: item.listingKind === 'convention' ? 'convention' : 'event',
    href: `/events/${item.slug}`,
    city: item.city,
    state: item.state,
    regionLabel: item.regionLabel,
    locationMode: isOnlineEvent(item) ? 'online' : item.state ? 'state_only' : 'nationwide',
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    summary: item.summary,
    tags: item.tags,
    categories: item.category ? [item.category] : undefined,
    logoUrl: item.logoUrl,
    organizerName: item.organizerName,
    dancecardEnabled: item.dancecardEnabled,
    newFriendly: item.newFriendly,
    sourceSystem: item.sourceSystem,
    sourceId: item.sourceId,
    lastSyncedAt: item.lastSyncedAt,
    status: item.status,
  }
}

function placeToRegional(place: PublicPlaceListing): PublicRegionalListing {
  let locationMode: PublicRegionalListing['locationMode'] = 'public'
  switch (place.venuePrivacyMode) {
    case 'city_only':
      locationMode = 'city_only'
      break
    case 'approximate_area':
      locationMode = 'region_only'
      break
    case 'hidden_until_registered':
      locationMode = 'hidden_until_registered'
      break
    case 'contact_for_location':
      locationMode = 'contact_for_location'
      break
    default:
      locationMode = 'public'
  }

  return {
    id: place.id,
    slug: place.slug,
    title: place.name,
    listingType: 'place',
    href: place.detailPath,
    city: place.city,
    state: place.state,
    regionLabel: place.regionLabel,
    locationMode,
    summary: place.shortSummary,
    logoUrl: place.logoUrl,
    coverImageUrl: place.coverImageUrl,
    hasUpcomingEvents: (place.upcomingEventCount ?? 0) > 0,
    sourceSystem: place.sourceSystem,
    sourceId: place.sourceId,
    lastSyncedAt: place.lastSyncedAt,
    status: place.status === 'temporarily_closed' ? 'published' : place.status,
  }
}

function vendorToRegional(vendor: PublicVendorListing): PublicRegionalListing {
  return {
    id: vendor.id,
    slug: vendor.slug,
    title: vendor.name,
    listingType: 'vendor',
    href: `/vendors/${vendor.slug}`,
    city: vendor.city,
    state: vendor.state,
    locationMode: vendor.onlineOnly ? 'online' : vendor.state ? 'state_only' : 'nationwide',
    summary: vendor.shortSummary,
    logoUrl: vendor.logoUrl,
    coverImageUrl: vendor.coverImageUrl,
    sourceSystem: vendor.sourceSystem,
    sourceId: vendor.sourceId,
    lastSyncedAt: vendor.lastSyncedAt,
    status: vendor.status,
  }
}

function educationToRegional(item: PublicEducationItem): PublicRegionalListing {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    listingType: 'article',
    href: `/education/${item.slug}`,
    locationMode: 'nationwide',
    summary: item.summary,
    tags: item.tags,
    sourceSystem: item.sourceSystem,
    sourceId: item.sourceId,
    lastSyncedAt: item.lastSyncedAt,
    status: item.status,
  }
}

export function pickRecentlyUpdated(ctx: {
  eventItems: PublicEventIndexItem[]
  places: PublicPlaceListing[]
  vendorListings: PublicVendorListing[]
  educationLibrary: PublicEducationItem[]
  limit?: number
}): PublicRegionalListing[] {
  const items: PublicRegionalListing[] = [
    ...ctx.eventItems.filter((e) => e.sourceSystem === 'kink_social').map(eventToRegional),
    ...ctx.places.filter((p) => p.sourceSystem === 'kink_social').map(placeToRegional),
    ...ctx.vendorListings.filter((v) => v.sourceSystem === 'kink_social').map(vendorToRegional),
    ...ctx.educationLibrary.filter((e) => e.sourceSystem === 'kink_social').map(educationToRegional),
  ]

  return items
    .filter((i) => i.lastSyncedAt)
    .sort((a, b) => (b.lastSyncedAt ?? '').localeCompare(a.lastSyncedAt ?? ''))
    .slice(0, ctx.limit ?? 8)
}

export function buildStateHubDetail(
  slug: StateSlug,
  ctx: Pick<
    StateHubContext,
    'eventItems' | 'places' | 'vendorListings' | 'educationLibrary'
  >
): StateHubDetail {
  const info = EAST_COAST_STATES[slug]
  const abbr = info.abbr
  const events = eventsForState(ctx.eventItems, abbr)
  const conventions = events.filter((e) => e.listingKind === 'convention')
  const regularEvents = events.filter((e) => e.listingKind !== 'convention')
  const places = placesForState(ctx.places, abbr)
  const vendors = vendorsForState(ctx.vendorListings, abbr)
  const education = educationForState(ctx.educationLibrary, abbr)
  const stats = computeStats(events, places, vendors, education)

  const stateRecent = [
    ...events.filter((e) => e.sourceSystem === 'kink_social').map(eventToRegional),
    ...places.filter((p) => p.sourceSystem === 'kink_social').map(placeToRegional),
    ...vendors.filter((v) => v.sourceSystem === 'kink_social').map(vendorToRegional),
  ]
    .filter((i) => i.lastSyncedAt)
    .sort((a, b) => (b.lastSyncedAt ?? '').localeCompare(a.lastSyncedAt ?? ''))
    .slice(0, 6)

  return {
    slug,
    info,
    stats,
    events: regularEvents,
    conventions,
    places,
    vendors,
    education,
    calendarPreview: events.slice(0, 8),
    recentlyUpdated: stateRecent,
  }
}

export function buildStateSummaries(
  ctx: Pick<
    StateHubContext,
    'eventItems' | 'places' | 'vendorListings' | 'educationLibrary'
  >
): StateHubSummary[] {
  return (Object.keys(EAST_COAST_STATES) as StateSlug[]).map((slug) => {
    const detail = buildStateHubDetail(slug, ctx)
    return { slug, info: detail.info, stats: detail.stats }
  }).sort((a, b) => b.stats.total - a.stats.total || a.info.name.localeCompare(b.info.name))
}

export async function loadStateHubContext(): Promise<StateHubContext> {
  const allDungeons = dedupeBySlug(getAllDungeons())
  const allSwingClubs = dedupeBySlug(getAllSwingClubs())
  const unifiedEvents = await getUnifiedEvents()
  const kinkSocialVenues = await fetchPublishedListingsIndex('venue')
  const unifiedVendors = await getUnifiedVendors()
  const articles = await getPublishedEducationArticles()

  const eventItems = buildIndexFromUnified(unifiedEvents)
  const places = mergePlaceListings(buildPlaceIndex(allDungeons, allSwingClubs, kinkSocialVenues, unifiedEvents))
  const vendorListings = buildVendorIndex(unifiedVendors, tagsBySlug)
  const { library } = splitByLane(buildEducationIndex(articles))

  const nationwideEvents = eventItems.filter(isNationwideEvent)
  const nationwideVendors = vendorListings.filter((v) => v.onlineOnly)

  const base = { eventItems, places, vendorListings, educationLibrary: library, nationwideEvents, nationwideVendors }
  const recentlyUpdated = pickRecentlyUpdated({ ...base, educationLibrary: library })
  const summaries = buildStateSummaries(base)

  return { ...base, recentlyUpdated, summaries }
}

export function getStateHubListingTotalFromStats(stats: StateHubStats): number {
  return stats.events + stats.conventions + stats.places
}

export function publicLocationLabel(item: {
  city?: string
  state?: string
  regionLabel?: string
  locationMode?: PublicRegionalListing['locationMode']
}): string {
  switch (item.locationMode) {
    case 'online':
      return 'Online'
    case 'nationwide':
      return 'Nationwide'
    case 'multi_state':
      return 'Multi-state'
    case 'hidden_until_registered':
      return 'Location shared after registration'
    case 'contact_for_location':
      return 'Contact for location'
    case 'city_only':
      return item.city && item.state ? `${item.city}, ${item.state}` : item.state ?? 'City only'
    case 'region_only':
      return item.regionLabel ?? item.city ?? item.state ?? 'Regional'
    default:
      if (item.city && item.state) return `${item.city}, ${item.state}`
      return item.state ?? 'Location on listing'
  }
}

