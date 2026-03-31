import type { UnifiedEvent } from '@/lib/unifiedEvents'
import type { DiscoveryParsed } from '@/lib/discoverySlug'
import { stateAbbrFromSlug, CITY_BY_SLUG, cityMatchesPhiladelphiaCluster } from '@/lib/discoverySlug'
import type { StateSlug } from '@/lib/eastCoastStates'

/** Normalize tag URL segment to slugs on events (hyphen vs underscore) */
function tagMatches(event: UnifiedEvent, tagSlug: string): boolean {
  const norm = tagSlug.toLowerCase().replace(/_/g, '-')
  const set = new Set(event.tagSlugs.map((t) => t.toLowerCase().replace(/_/g, '-')))
  if (set.has(norm)) return true
  return event.tagSlugs.some((t) => t.toLowerCase().replace(/_/g, '-') === norm)
}

export function filterDiscoveryEvents(
  events: UnifiedEvent[],
  parsed: DiscoveryParsed
): UnifiedEvent[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const upcoming = events.filter((e) => new Date(e.date.end) >= now)

  if (parsed.kind === 'special') {
    if (parsed.special === 'weekend') {
      const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      return upcoming
        .filter((e) => {
          const s = new Date(e.date.start)
          return s >= now && s <= end
        })
        .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
    }
    if (parsed.special === 'near_philadelphia') {
      return upcoming.filter(
        (e) =>
          cityMatchesPhiladelphiaCluster(e.location.city, e.location.state) ||
          (e.location.state === 'PA' && /philadelphia|philly/i.test(e.location.city))
      )
    }
    return []
  }

  if (parsed.kind === 'state') {
    const abbr = stateAbbrFromSlug(parsed.stateSlug as StateSlug)
    return upcoming.filter((e) => e.location.state === abbr)
  }

  if (parsed.kind === 'city') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    if (!entry) return []
    return upcoming.filter(
      (e) => e.location.state === entry.stateAbbr && entry.matchCity(e.location.city)
    )
  }

  if (parsed.kind === 'stateTag') {
    const abbr = stateAbbrFromSlug(parsed.stateSlug as StateSlug)
    return upcoming.filter((e) => e.location.state === abbr && tagMatches(e, parsed.tagSlug))
  }

  if (parsed.kind === 'cityTag') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    if (!entry) return []
    return upcoming.filter(
      (e) =>
        e.location.state === entry.stateAbbr &&
        entry.matchCity(e.location.city) &&
        tagMatches(e, parsed.tagSlug)
    )
  }

  return []
}
