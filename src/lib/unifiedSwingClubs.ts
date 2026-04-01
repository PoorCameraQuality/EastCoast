import { getAllSwingClubs } from '@/data/swingClubs'
import { getAllEvents } from '@/data/events'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import {
  inferSwingHubTags,
  swingMatchesHubTag,
  type SwingSeoHubTagSlug,
} from '@/lib/swingHubTagMap'

export type SwingClubRecord = ReturnType<typeof getAllSwingClubs>[number]

export type UnifiedSwingClub = SwingClubRecord & {
  discoveryTagSlugs: SwingSeoHubTagSlug[]
}

function toUnified(c: SwingClubRecord): UnifiedSwingClub {
  return {
    ...c,
    discoveryTagSlugs: inferSwingHubTags(c),
  }
}

export function getUnifiedSwingClubs(): UnifiedSwingClub[] {
  return getAllSwingClubs().map(toUnified)
}

export type SwingHubFilter = {
  stateSlug?: StateSlug
  citySlug?: string
  tagSlug?: SwingSeoHubTagSlug
}

export function filterSwingClubsForHub(
  clubs: UnifiedSwingClub[],
  filter: SwingHubFilter
): UnifiedSwingClub[] {
  let list = clubs

  if (filter.stateSlug) {
    const abbr = EAST_COAST_STATES[filter.stateSlug].abbr
    list = list.filter((c) => c.location?.state === abbr)
  }

  if (filter.citySlug && filter.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[filter.citySlug as keyof typeof CITY_BY_SLUG]
    list = list.filter(
      (c) =>
        c.location?.state === entry.stateAbbr && entry.matchCity(c.location?.city || '')
    )
  }

  if (filter.tagSlug) {
    const hub = filter.tagSlug
    list = list.filter((c) => swingMatchesHubTag(c.discoveryTagSlugs, hub))
  }

  return list
}

function eventIsUpcoming(event: { date: { end: string } }): boolean {
  return new Date(event.date.end) >= new Date(new Date().toISOString().slice(0, 10))
}

/** Same geo rules as dungeon hubs — upcoming static events for swing hub context. */
export function getUpcomingEventsForSwingHub(args: {
  variant: 'state' | 'city' | 'tag' | 'stateTag' | 'cityTag'
  stateSlug?: StateSlug
  citySlug?: string
  filteredSwingClubs: UnifiedSwingClub[]
}): ReturnType<typeof getAllEvents> {
  const all = getAllEvents().filter(eventIsUpcoming)
  const max = 24

  if (args.variant === 'state' && args.stateSlug) {
    const abbr = EAST_COAST_STATES[args.stateSlug].abbr
    return all.filter((e) => e.location?.state === abbr).slice(0, max)
  }

  if (args.variant === 'city' && args.citySlug && args.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[args.citySlug as keyof typeof CITY_BY_SLUG]
    return all
      .filter(
        (e) =>
          e.location?.state === entry.stateAbbr && entry.matchCity(e.location?.city || '')
      )
      .slice(0, max)
  }

  if (
    (args.variant === 'tag' || args.variant === 'stateTag' || args.variant === 'cityTag') &&
    args.filteredSwingClubs.length
  ) {
    const states = new Set(args.filteredSwingClubs.map((c) => c.location.state))
    return all.filter((e) => e.location?.state && states.has(e.location.state)).slice(0, max)
  }

  return all.slice(0, max)
}
