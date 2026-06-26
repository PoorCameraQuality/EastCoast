import { getAllDungeons } from '@/data/dungeons'
import { getAllSwingClubs } from '@/data/swingClubs'
import { tagsBySlug } from '@/data/vendorTaxonomy'
import { getPublishedEducationArticles } from '@/lib/educationArticles'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { buildEducationIndex, splitByLane } from '@/lib/publicEducationIndex'
import { buildIndexFromUnified, splitUpcomingPast } from '@/lib/publicEventIndex'
import { buildPlaceIndex, mergePlaceListings } from '@/lib/publicPlaceIndex'
import { buildVendorIndex } from '@/lib/publicVendorIndex'
import { publicLocationLabel } from '@/lib/publicStateIndex'
import { getUnifiedEvents } from '@/lib/unifiedEvents'
import { getUnifiedVendors } from '@/lib/unifiedVendors'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import type { EckeSearchDocument, EckeSearchEntityType, EckeSearchResult } from '@/types/eckeSearchResult'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

const CATALOG_CACHE_MS = 5 * 60 * 1000

let catalogCache: { loadedAt: number; documents: EckeSearchDocument[] } | null = null

function dedupeBySlug<T extends { slug: string; name: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of items) map.set(item.slug, item)
  return Array.from(map.values())
}

function placeLocationLabel(place: PublicPlaceListing): string {
  const mode =
    place.venuePrivacyMode === 'city_only'
      ? 'city_only'
      : place.venuePrivacyMode === 'hidden_until_registered'
        ? 'hidden_until_registered'
        : place.venuePrivacyMode === 'contact_for_location'
          ? 'contact_for_location'
          : place.venuePrivacyMode === 'approximate_area'
            ? 'region_only'
            : 'public'

  return publicLocationLabel({
    city: place.city,
    state: place.state,
    regionLabel: place.regionLabel,
    locationMode: mode,
  })
}

function flattenTags(tags?: string | string[]): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

function buildSearchText(parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join(' ').toLowerCase()
}

export async function loadEckeSearchCatalog(): Promise<EckeSearchDocument[]> {
  const now = Date.now()
  if (catalogCache && now - catalogCache.loadedAt < CATALOG_CACHE_MS) {
    return catalogCache.documents
  }

  const unifiedEvents = await getUnifiedEvents()
  const unifiedVendors = await getUnifiedVendors()
  const kinkSocialVenues = await fetchPublishedListingsIndex('venue')
  const articles = await getPublishedEducationArticles()

  const eventItems = buildIndexFromUnified(unifiedEvents)
  const { upcoming } = splitUpcomingPast(eventItems)
  const places = mergePlaceListings(
    buildPlaceIndex(
      dedupeBySlug(getAllDungeons()),
      dedupeBySlug(getAllSwingClubs()),
      kinkSocialVenues,
      unifiedEvents
    )
  )
  const vendors = buildVendorIndex(unifiedVendors, tagsBySlug)
  const { library } = splitByLane(buildEducationIndex(articles))

  const documents: EckeSearchDocument[] = []

  for (const event of upcoming) {
    const entityType: EckeSearchEntityType =
      event.listingKind === 'convention' ? 'convention' : 'event'
    const locationLabel =
      event.city && event.state ? `${event.city}, ${event.state}` : event.state ?? undefined

    documents.push({
      id: `${entityType}:${event.slug}`,
      entityType,
      slug: event.slug,
      title: event.title,
      href: `/events/${event.slug}`,
      summary: event.summary,
      category: event.category,
      locationLabel,
      state: event.state,
      city: event.city,
      logoUrl: event.logoUrl ?? undefined,
      dateDisplay: event.dateDisplay,
      tags: event.tags,
      sourceSystem: event.sourceSystem,
      searchText: buildSearchText([
        event.title,
        event.summary,
        event.category,
        event.city,
        event.state,
        event.organizerName,
        ...(event.tags ?? []),
      ]),
    })
  }

  for (const place of places) {
    documents.push({
      id: `place:${place.slug}`,
      entityType: 'place',
      slug: place.slug,
      title: place.name,
      href: place.detailPath,
      summary: place.shortSummary,
      category: place.placeType.replace(/_/g, ' '),
      locationLabel: placeLocationLabel(place),
      state: place.state,
      city: place.city,
      logoUrl: place.logoUrl ?? place.coverImageUrl,
      tags: place.amenities,
      sourceSystem: place.sourceSystem,
      searchText: buildSearchText([
        place.name,
        place.shortSummary,
        place.city,
        place.state,
        place.placeType,
        ...(place.amenities ?? []),
      ]),
    })
  }

  for (const vendor of vendors) {
    documents.push({
      id: `vendor:${vendor.slug}`,
      entityType: 'vendor',
      slug: vendor.slug,
      title: vendor.name,
      href: `/vendors/${vendor.slug}`,
      summary: vendor.shortSummary,
      category: vendor.tagline,
      locationLabel: vendor.onlineOnly
        ? 'Online'
        : vendor.city && vendor.state
          ? `${vendor.city}, ${vendor.state}`
          : vendor.locationLabel,
      state: vendor.state,
      city: vendor.city,
      logoUrl: vendor.logoUrl ?? vendor.coverImageUrl,
      tags: vendor.craftTags,
      sourceSystem: vendor.sourceSystem,
      searchText: buildSearchText([
        vendor.name,
        vendor.shortSummary,
        vendor.locationLabel,
        vendor.city,
        vendor.state,
        ...(vendor.craftTags ?? []),
        ...(vendor.productCategories ?? []),
      ]),
    })
  }

  for (const item of library) {
    documents.push({
      id: `education:${item.slug}`,
      entityType: 'education',
      slug: item.slug,
      title: item.title,
      href: `/education/${item.slug}`,
      summary: item.summary,
      category: item.topic,
      tags: item.tags,
      sourceSystem: item.sourceSystem,
      searchText: buildSearchText([item.title, item.summary, item.topic, ...(item.tags ?? [])]),
    })
  }

  for (const [slug, info] of Object.entries(EAST_COAST_STATES) as [StateSlug, (typeof EAST_COAST_STATES)[StateSlug]][]) {
    documents.push({
      id: `state:${slug}`,
      entityType: 'state',
      slug,
      title: `${info.name} scene hub`,
      href: `/states/${slug}`,
      summary: `Events, places, vendors, and education in ${info.name}.`,
      category: info.region,
      locationLabel: info.abbr,
      state: info.abbr,
      sourceSystem: 'ecke',
      searchText: buildSearchText([info.name, info.abbr, info.region, slug.replace(/-/g, ' ')]),
    })
  }

  catalogCache = { loadedAt: now, documents }
  return documents
}

function scoreDocument(doc: EckeSearchDocument, query: string): number {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return 0

  const tokens = q.split(/\s+/).filter(Boolean)
  const title = doc.title.toLowerCase()
  const text = doc.searchText

  let score = 0

  if (title === q) score += 120
  else if (title.startsWith(q)) score += 95
  else if (title.includes(q)) score += 75

  for (const token of tokens) {
    if (title.includes(token)) score += 25
    if (text.includes(token)) score += 12
    if (doc.state?.toLowerCase() === token) score += 20
    if (doc.city?.toLowerCase().includes(token)) score += 18
    if (doc.tags?.some((t) => t.toLowerCase().includes(token))) score += 15
    if (doc.category?.toLowerCase().includes(token)) score += 12
  }

  if (doc.sourceSystem === 'kink_social') score += 3

  return score
}

export type SearchEckeOptions = {
  query: string
  limit?: number
  entityType?: EckeSearchEntityType
  state?: string
}

export async function searchEckeCatalog(options: SearchEckeOptions): Promise<{
  results: EckeSearchResult[]
  total: number
}> {
  const query = options.query.trim()
  if (query.length < 2) return { results: [], total: 0 }

  const limit = Math.min(Math.max(options.limit ?? 10, 1), 25)
  const stateFilter = options.state?.trim().toUpperCase()

  const catalog = await loadEckeSearchCatalog()

  const scored: EckeSearchResult[] = []

  for (const doc of catalog) {
    if (options.entityType && doc.entityType !== options.entityType) continue
    if (stateFilter && doc.entityType !== 'state' && doc.state?.toUpperCase() !== stateFilter) continue

    const raw = scoreDocument(doc, query)
    if (raw <= 0) continue

    const { searchText: _omit, ...rest } = doc
    scored.push({
      ...rest,
      relevanceScore: Math.min(100, raw),
    })
  }

  scored.sort(
    (a, b) => b.relevanceScore - a.relevanceScore || a.title.localeCompare(b.title)
  )

  return { results: scored.slice(0, limit), total: scored.length }
}

/** Invalidate in-memory catalog (e.g. after ingest in tests). */
export function clearEckeSearchCatalogCache(): void {
  catalogCache = null
}
