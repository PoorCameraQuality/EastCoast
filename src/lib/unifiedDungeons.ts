import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import {
  dungeonMatchesHubTag,
  inferDungeonHubTags,
  type DungeonSeoHubTagSlug,
} from '@/lib/dungeonHubTagMap'

export type DungeonRecord = ReturnType<typeof getAllDungeons>[number]

export type UnifiedDungeon = DungeonRecord & {
  discoveryTagSlugs: DungeonSeoHubTagSlug[]
}

function toUnified(d: DungeonRecord): UnifiedDungeon {
  return {
    ...d,
    discoveryTagSlugs: inferDungeonHubTags(d),
  }
}

export function getUnifiedDungeons(): UnifiedDungeon[] {
  return getAllDungeons().map(toUnified)
}

export type DungeonHubFilter = {
  stateSlug?: StateSlug
  citySlug?: string
  tagSlug?: DungeonSeoHubTagSlug
}

export function filterDungeonsForHub(
  dungeons: UnifiedDungeon[],
  filter: DungeonHubFilter
): UnifiedDungeon[] {
  let list = dungeons

  if (filter.stateSlug) {
    const abbr = EAST_COAST_STATES[filter.stateSlug].abbr
    list = list.filter((d) => d.location?.state === abbr)
  }

  if (filter.citySlug && filter.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[filter.citySlug as keyof typeof CITY_BY_SLUG]
    list = list.filter(
      (d) =>
        d.location?.state === entry.stateAbbr && entry.matchCity(d.location?.city || '')
    )
  }

  if (filter.tagSlug) {
    const hub = filter.tagSlug
    list = list.filter((d) => dungeonMatchesHubTag(d.discoveryTagSlugs, hub))
  }

  return list
}

function eventIsUpcoming(event: { date: { end: string } }): boolean {
  return new Date(event.date.end) >= new Date(new Date().toISOString().slice(0, 10))
}

/** Upcoming static events for dungeon hub context (geographic v1). */
export function getUpcomingEventsForDungeonHub(args: {
  variant: 'state' | 'city' | 'tag' | 'stateTag' | 'cityTag'
  stateSlug?: StateSlug
  citySlug?: string
  filteredDungeons: UnifiedDungeon[]
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

  if (args.variant === 'stateTag' && args.stateSlug) {
    const abbr = EAST_COAST_STATES[args.stateSlug].abbr
    return all.filter((e) => e.location?.state === abbr).slice(0, max)
  }

  if (args.variant === 'cityTag' && args.citySlug && args.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[args.citySlug as keyof typeof CITY_BY_SLUG]
    return all
      .filter(
        (e) =>
          e.location?.state === entry.stateAbbr && entry.matchCity(e.location?.city || '')
      )
      .slice(0, max)
  }

  // tag-only: union of states represented in filtered dungeons
  const states = new Set(
    args.filteredDungeons.map((d) => d.location?.state).filter(Boolean) as string[]
  )
  if (states.size === 0) return []
  return all.filter((e) => states.has(e.location?.state)).slice(0, max)
}
