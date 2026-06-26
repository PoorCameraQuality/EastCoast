import type { UnifiedEvent } from '@/lib/unifiedEvents'
import type {
  PublicEventIndexItem,
  PublicEventListingKind,
  PublicEventType,
} from '@/types/publicEventIndexItem'
import { normalizeEventMedia, type EventMedia } from '@/lib/eventMedia'
import { fallbackTheme, type EventBrandTheme } from '@/lib/eventBrandTheme'
import { getEventThemeOverride } from '@/lib/eventThemeOverrides'

export type EventIndexCardModel = PublicEventIndexItem & {
  media: EventMedia
  brand: EventBrandTheme
}

function inferListingKind(e: UnifiedEvent): PublicEventListingKind {
  const text = `${e.category} ${e.name} ${e.excerpt}`.toLowerCase()
  if (
    e.tagSlugs.includes('convention') ||
    /convention|conference|weekend event|hotel weekend/i.test(e.category)
  ) {
    return 'convention'
  }
  if (/convention|conference|weekend|fest\b|leather weekend/i.test(text)) return 'convention'
  return 'event'
}

function inferEventType(e: UnifiedEvent): PublicEventType {
  const text = `${e.category} ${e.excerpt} ${e.name}`.toLowerCase()
  if (e.tagSlugs.includes('classes') || /workshop|class|education/i.test(e.category)) return 'class'
  if (e.tagSlugs.includes('play-party') || /play party|party/i.test(e.category)) return 'party'
  if (e.tagSlugs.includes('munch') || /munch/i.test(e.category)) return 'munch'
  if (/vendor|market|bazaar|mart/i.test(text)) return 'vendor_market'
  if (/outdoor|campout|camp\b|retreat/i.test(e.category) || /outdoor|campout/i.test(text))
    return 'campout'
  if (/hotel|weekend/i.test(text) && inferListingKind(e) === 'convention') return 'hotel_weekend'
  if (/online|virtual|zoom/i.test(text)) return 'online'
  return 'other'
}

function startOfToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

function isThisWeekend(startIso: string): boolean {
  const start = new Date(startIso)
  const today = startOfToday()
  const day = today.getDay()
  const daysUntilSaturday = (6 - day + 7) % 7
  const sat = new Date(today)
  sat.setDate(today.getDate() + daysUntilSaturday)
  const sun = new Date(sat)
  sun.setDate(sat.getDate() + 1)
  const endWeekend = new Date(sun)
  endWeekend.setHours(23, 59, 59, 999)
  return start >= sat && start <= endWeekend
}

function eventDurationDays(e: PublicEventIndexItem): number {
  const start = new Date(e.startsAt).getTime()
  const end = new Date(e.endsAt).getTime()
  return Math.max(1, Math.round((end - start) / (86400000)) + 1)
}

export function unifiedToIndexItem(e: UnifiedEvent): PublicEventIndexItem {
  return {
    id: e.c2kSourceId ?? e.slug,
    slug: e.slug,
    title: e.name,
    listingKind: inferListingKind(e),
    eventType: inferEventType(e),
    startsAt: e.date.start,
    endsAt: e.date.end,
    dateDisplay: e.date.display,
    city: e.location.city,
    state: e.location.state,
    regionLabel: e.location.region || undefined,
    logoUrl: e.logo,
    summary: e.excerpt || undefined,
    tags: e.tagSlugs,
    category: e.category,
    organizerName: e.organizer,
    dancecardEnabled: e.dancecardEnabled,
    newFriendly: e.tagSlugs.includes('beginner-friendly'),
    sourceSystem: e.c2kSourceId ? 'kink_social' : 'ecke',
    sourceId: e.c2kSourceId ?? undefined,
    lastSyncedAt: e.lastSyncedAt,
    status: 'published',
  }
}

export function syncBrandForIndex(slug: string, category: string): EventBrandTheme {
  return getEventThemeOverride(slug) ?? fallbackTheme(slug, category)
}

export function toIndexCardModel(item: PublicEventIndexItem): EventIndexCardModel {
  const media = normalizeEventMedia({
    name: item.title,
    logo: item.logoUrl ?? item.bannerUrl,
    source: item.sourceSystem === 'kink_social' ? 'supabase' : 'static',
    c2kSourceId: item.sourceId,
  })
  return {
    ...item,
    media,
    brand: syncBrandForIndex(item.slug, item.category),
  }
}

export function buildIndexFromUnified(events: UnifiedEvent[]): PublicEventIndexItem[] {
  return events.map(unifiedToIndexItem)
}

export function splitUpcomingPast(items: PublicEventIndexItem[]) {
  const today = startOfToday()
  const upcoming = items
    .filter((e) => new Date(e.endsAt) >= today)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  const past = items
    .filter((e) => new Date(e.endsAt) < today)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
  return { upcoming, past }
}

export function featuredScore(item: PublicEventIndexItem): number {
  let score = 0
  if (item.listingKind === 'convention') score += 40
  if (item.eventType === 'hotel_weekend') score += 25
  if (eventDurationDays(item) >= 3) score += 20
  if (item.logoUrl) score += 15
  if (item.dancecardEnabled) score += 15
  if (item.sourceSystem === 'kink_social') score += 10
  return score
}

export function pickFeatured(items: PublicEventIndexItem[], limit = 4): PublicEventIndexItem[] {
  return [...items]
    .sort((a, b) => featuredScore(b) - featuredScore(a) || new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, limit)
}

export type EventsListIntent =
  | 'all'
  | 'this-weekend'
  | 'conventions'
  | 'classes'
  | 'parties'
  | 'vendor-markets'
  | 'outdoor'
  | 'new-friendly'
  | 'dancecard'
  | 'kink-social'
  | 'outdoor-events'
  | 'indoor-events'

export const EVENT_INTENT_OPTIONS: { id: EventsListIntent; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'this-weekend', label: 'This weekend' },
  { id: 'conventions', label: 'Conventions' },
  { id: 'classes', label: 'Classes' },
  { id: 'parties', label: 'Parties' },
  { id: 'vendor-markets', label: 'Vendor markets' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'new-friendly', label: 'New-friendly' },
  { id: 'dancecard', label: 'Dancecard' },
  { id: 'kink-social', label: 'From kink.social' },
]

export function matchesIntent(item: PublicEventIndexItem, intent: EventsListIntent): boolean {
  if (intent === 'all') return true
  if (intent === 'this-weekend') return isThisWeekend(item.startsAt)
  if (intent === 'conventions') return item.listingKind === 'convention'
  if (intent === 'classes') return item.eventType === 'class' || item.tags.includes('classes')
  if (intent === 'parties')
    return item.eventType === 'party' || /party|social/i.test(item.category)
  if (intent === 'vendor-markets') return item.eventType === 'vendor_market'
  if (intent === 'outdoor' || intent === 'outdoor-events')
    return item.eventType === 'campout' || /outdoor/i.test(item.category)
  if (intent === 'indoor-events') return /indoor/i.test(item.category)
  if (intent === 'new-friendly') return item.newFriendly === true
  if (intent === 'dancecard') return item.dancecardEnabled === true
  if (intent === 'kink-social') return item.sourceSystem === 'kink_social'
  return true
}

export function intentCounts(items: PublicEventIndexItem[]): Partial<Record<EventsListIntent, number>> {
  const counts: Partial<Record<EventsListIntent, number>> = {}
  for (const opt of EVENT_INTENT_OPTIONS) {
    if (opt.id === 'all') continue
    const n = items.filter((i) => matchesIntent(i, opt.id)).length
    if (n > 0) counts[opt.id] = n
  }
  return counts
}

export function sourceLabel(item: PublicEventIndexItem): string | null {
  if (item.sourceSystem === 'kink_social') return 'Published from kink.social'
  return null
}
