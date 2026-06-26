import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { getAllArticles } from '@/data/education'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { deriveEventBrandTheme } from '@/lib/eventBrandTheme.server'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { getHubCategoryCounts, type HubCategoryCounts } from '@/lib/homeHubCounts'
import { normalizeEventMedia, type EventMedia } from '@/lib/eventMedia'
import { getTopStatesByActivity, type TopStateEntry } from '@/lib/topStatesByActivity'
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

const EDUCATION_GUIDE_SPECS: { title: string; topic: string; slugHints: string[] }[] = [
  {
    title: 'What to expect at a kink event',
    topic: 'Events',
    slugHints: ['kink-event', 'first-event', 'convention'],
  },
  {
    title: 'How to find local community',
    topic: 'Community',
    slugHints: ['local-community', 'find-community', 'munch'],
  },
  {
    title: 'Consent and negotiation basics',
    topic: 'Safety',
    slugHints: ['consent', 'negotiation', 'ssc-vs-rack'],
  },
  {
    title: 'Packing for a convention weekend',
    topic: 'Travel',
    slugHints: ['packing', 'convention', 'weekend'],
  },
  {
    title: 'Using Dancecard at supported events',
    topic: 'Dancecard',
    slugHints: ['dancecard'],
  },
]

function resolveEducationGuides(): StorefrontEducationGuide[] {
  const articles = getAllArticles()
  return EDUCATION_GUIDE_SPECS.map((spec) => {
    const match =
      articles.find((a) => spec.slugHints.some((h) => a.slug.includes(h))) ??
      articles.find((a) => a.title.toLowerCase().includes(spec.title.split(' ')[0].toLowerCase()))
    return {
      title: match?.title ?? spec.title,
      href: match ? `/education/${match.slug}` : '/education',
      topic: spec.topic,
    }
  })
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

export async function getHomepageStorefrontData(): Promise<HomepageStorefrontData> {
  const [vendors, unified] = await Promise.all([getUnifiedVendors(), getUnifiedEvents()])
  const hubCounts = await getHubCategoryCounts({ vendorCount: vendors.length })
  const upcomingUnified = getUpcomingUnified(unified)
  const upcomingSlice = upcomingUnified.slice(0, 8)
  const upcomingEvents = await Promise.all(upcomingSlice.map(toStorefrontEvent))
  const topStates = getTopStatesByActivity(12)
  const featuredState = topStates.find((s) => s.slug === 'pennsylvania') ?? topStates[0] ?? null

  const supporters = vendors.filter((v) => v.isPaid)
  const others = vendors.filter((v) => !v.isPaid).sort((a, b) => a.slug.localeCompare(b.slug))
  const featuredVendor = supporters[0] ?? others[0] ?? null
  const vendorPreview = [
    ...(featuredVendor ? [featuredVendor] : []),
    ...others.filter((v) => v.slug !== featuredVendor?.slug).slice(0, 4),
  ].slice(0, 5)

  const dungeons = getAllDungeons()
    .slice(0, 4)
    .map((d) => ({
      name: d.name,
      slug: d.slug,
      excerpt: d.excerpt,
      logo: d.logo,
      location: d.location,
    }))

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
    educationGuides: resolveEducationGuides(),
    monthPreviews: buildMonthPreviews(upcomingUnified),
    searchEvents: getAllEvents(),
    searchDungeons: getAllDungeons(),
  }
}
