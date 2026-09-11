import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { getAllArticles } from '@/data/education'
import { getAllSwingClubs } from '@/data/swingClubs'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { deriveEventBrandTheme } from '@/lib/eventBrandTheme.server'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { getHubCategoryCounts, type HubCategoryCounts } from '@/lib/homeHubCounts'
import { normalizeEventMedia, type EventMedia } from '@/lib/eventMedia'
import {
  HOMEPAGE_RAIL_COUNTS,
  catalogItemEligible,
  channelSeed,
  homepageRotationSeed,
  pickRotatedBySlug,
} from '@/lib/homepageRotation'
import { getTopStatesByActivity, type TopStateEntry } from '@/lib/topStatesByActivity'
import { isNationalConventionListing, unifiedToIndexItem } from '@/lib/publicEventIndex'
import { getUnifiedDungeonsAsync } from '@/lib/unifiedDungeons'
import { getUnifiedEvents, getUpcomingUnified, type UnifiedEvent } from '@/lib/unifiedEvents'
import { getUnifiedVendors } from '@/lib/unifiedVendors'
import type { VendorRecord } from '@/lib/vendorFiltering'

export type StorefrontEvent = {
  name: string
  slug: string
  date: { start: string; end: string; display: string }
  location: { city: string; state: string; region: string }
  excerpt: string
  category: string
  logo?: string
  tagSlugs?: string[]
  media: EventMedia
  brand: EventBrandTheme
}

export type StorefrontDungeon = {
  name: string
  slug: string
  excerpt: string
  logo?: string
  location: { city: string; state: string }
  href: string
  entityType: 'dungeon' | 'swingClub'
}

export type StorefrontEducationGuide = {
  title: string
  href: string
  topic: string
}

export type MonthPreview = {
  key: string
  label: string
  shortLabel: string
  eventCount: number
  isActive: boolean
}

export type HomepageStorefrontData = {
  hubCounts: HubCategoryCounts
  upcomingCount: number
  stateHubCount: number
  upcomingEvents: StorefrontEvent[]
  featuredEvent: StorefrontEvent | null
  topStates: TopStateEntry[]
  featuredState: TopStateEntry | null
  vendors: VendorRecord[]
  featuredVendor: VendorRecord | null
  vendorPreview: VendorRecord[]
  dungeons: StorefrontDungeon[]
  educationGuides: StorefrontEducationGuide[]
  monthPreviews: MonthPreview[]
  searchEvents: ReturnType<typeof getAllEvents>
  searchDungeons: ReturnType<typeof getAllDungeons>
}

async function toStorefrontEvent(e: UnifiedEvent): Promise<StorefrontEvent> {
  const media = normalizeEventMedia(e)
  const brand = await deriveEventBrandTheme(media, e.slug, e.category)
  return {
    name: e.name,
    slug: e.slug,
    date: e.date,
    location: e.location,
    excerpt: e.excerpt,
    category: e.category,
    logo: e.logo,
    tagSlugs: e.tagSlugs,
    media,
    brand,
  }
}

function resolveEducationGuides(seed: number): StorefrontEducationGuide[] {
  const articles = getAllArticles()
    .filter((article) => catalogItemEligible(article.slug, article.title))
    .map((article) => ({
      slug: article.slug,
      title: article.title.trim(),
      href: `/education/${article.slug}`,
      topic: (article.category || 'Guide').trim(),
    }))
  return pickRotatedBySlug(articles, HOMEPAGE_RAIL_COUNTS.education, channelSeed(seed, 'education')).map(
    ({ title, href, topic }) => ({ title, href, topic }),
  )
}

function rotateStatesWithEvents(states: TopStateEntry[], seed: number): TopStateEntry[] {
  const withEvents = states.filter((state) => state.eventCount > 0)
  return pickRotatedBySlug(withEvents, HOMEPAGE_RAIL_COUNTS.states, channelSeed(seed, 'states'))
}

function rotateVendors(vendors: VendorRecord[], seed: number): VendorRecord[] {
  const pool = vendors.filter(
    (vendor) => vendor.status !== 'draft' && catalogItemEligible(vendor.slug, vendor.name),
  )
  return pickRotatedBySlug(pool, HOMEPAGE_RAIL_COUNTS.vendors, channelSeed(seed, 'vendors'))
}

function toStorefrontSpace(input: {
  name?: string
  slug?: string
  excerpt?: string
  logo?: string
  location?: { city?: string; state?: string }
  href: string
  entityType: 'dungeon' | 'swingClub'
  status?: 'draft' | 'published'
}): StorefrontDungeon | null {
  if (input.status === 'draft') return null
  if (!catalogItemEligible(input.slug, input.name)) return null
  return {
    name: input.name!.trim(),
    slug: input.slug!.trim(),
    excerpt: (input.excerpt || '').trim(),
    logo: input.logo,
    location: {
      city: (input.location?.city || '').trim(),
      state: (input.location?.state || '').trim(),
    },
    href: input.href,
    entityType: input.entityType,
  }
}

function rotateSpaces(
  dungeons: Array<{
    name?: string
    slug?: string
    excerpt?: string
    logo?: string
    location?: { city?: string; state?: string }
    status?: 'draft' | 'published'
  }>,
  seed: number,
): StorefrontDungeon[] {
  const dungeonSpaces = dungeons
    .map((dungeon) =>
      toStorefrontSpace({
        ...dungeon,
        href: `/dungeons/${(dungeon.slug || '').trim()}`,
        entityType: 'dungeon',
      }),
    )
    .filter((row): row is StorefrontDungeon => Boolean(row))

  const swingSpaces = getAllSwingClubs()
    .map((club: { name?: string; slug?: string; excerpt?: string; logo?: string; location?: { city?: string; state?: string } }) =>
      toStorefrontSpace({
        ...club,
        href: `/swing-clubs/${(club.slug || '').trim()}`,
        entityType: 'swingClub',
      }),
    )
    .filter((row): row is StorefrontDungeon => Boolean(row))

  return pickRotatedBySlug(
    [...dungeonSpaces, ...swingSpaces],
    HOMEPAGE_RAIL_COUNTS.spaces,
    channelSeed(seed, 'spaces'),
  )
}

function buildMonthPreviews(events: UnifiedEvent[]): MonthPreview[] {
  const now = new Date()
  const months: MonthPreview[] = []

  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    const eventCount = events.filter((e) => {
      const s = new Date(e.date.start)
      return s >= start && s <= end
    }).length

    months.push({
      key,
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      shortLabel: d.toLocaleString('en-US', { month: 'short' }),
      eventCount,
      isActive: i === 0,
    })
  }

  return months
}

export async function getHomepageStorefrontData(options?: {
  rotationSeed?: number
  now?: Date
}): Promise<HomepageStorefrontData> {
  const seed = options?.rotationSeed ?? homepageRotationSeed(options?.now)
  const [vendors, unified, unifiedDungeons] = await Promise.all([
    getUnifiedVendors(),
    getUnifiedEvents(),
    getUnifiedDungeonsAsync(),
  ])
  const hubCounts = await getHubCategoryCounts({ vendorCount: vendors.length })
  const upcomingUnified = getUpcomingUnified(unified).filter((event) =>
    isNationalConventionListing(unifiedToIndexItem(event)),
  )
  const pinnedFeatured = upcomingUnified.filter((event) => event.featured)
  const remainingUpcoming = upcomingUnified.filter((event) => !event.featured)
  const upcomingSlice = [...pinnedFeatured, ...remainingUpcoming].slice(0, 8)
  const upcomingEvents = await Promise.all(upcomingSlice.map(toStorefrontEvent))
  const allStates = getTopStatesByActivity(Number.MAX_SAFE_INTEGER)
  const topStates = rotateStatesWithEvents(allStates, seed)
  const featuredState = allStates.find((s) => s.slug === 'pennsylvania') ?? allStates[0] ?? null

  const supporters = vendors.filter((v) => v.isPaid && catalogItemEligible(v.slug, v.name))
  const vendorPreview = rotateVendors(vendors, seed)
  const featuredVendor = supporters[0] ?? vendorPreview[0] ?? null
  const dungeons = rotateSpaces(unifiedDungeons, seed)

  return {
    hubCounts,
    upcomingCount: Math.min(upcomingUnified.length, 16),
    stateHubCount: Object.keys(EAST_COAST_STATES).length,
    upcomingEvents,
    featuredEvent: upcomingEvents[0] ?? null,
    topStates,
    featuredState,
    vendors,
    featuredVendor,
    vendorPreview,
    dungeons,
    educationGuides: resolveEducationGuides(seed),
    monthPreviews: buildMonthPreviews(upcomingUnified),
    searchEvents: getAllEvents(),
    searchDungeons: getAllDungeons(),
  }
}
