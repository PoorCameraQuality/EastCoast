import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'

export type StateStatEntry = {
  slug: StateSlug
  info: (typeof EAST_COAST_STATES)[StateSlug]
  eventCount: number
  dungeonCount: number
  total: number
}

export function sortStatesByActivity(a: StateStatEntry, b: StateStatEntry): number {
  return b.total - a.total || b.eventCount - a.eventCount || a.info.name.localeCompare(b.info.name)
}

/** Upcoming events + dungeon counts per state/province hub. */
export function getStateStats(): StateStatEntry[] {
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const now = new Date()

  const stateStats = (Object.entries(EAST_COAST_STATES) as [StateSlug, StateStatEntry['info']][]).map(
    ([slug, info]) => {
      const eventCount = allEvents.filter(
        (event) => event.location.state === info.abbr && new Date(event.date.end) >= now
      ).length
      const dungeonCount = allDungeons.filter((dungeon) => dungeon.location.state === info.abbr).length
      return { slug, info, eventCount, dungeonCount, total: eventCount + dungeonCount }
    }
  )

  stateStats.sort(sortStatesByActivity)
  return stateStats
}
