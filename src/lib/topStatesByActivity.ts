import { getStateStats } from '@/lib/stateStats'
import type { StateSlug } from '@/lib/eastCoastStates'

export type TopStateEntry = {
  slug: StateSlug
  name: string
  abbr: string
  eventCount: number
  dungeonCount: number
  total: number
}

/** Top states by upcoming events + dungeon listings (for homepage chips). */
export function getTopStatesByActivity(limit: number): TopStateEntry[] {
  return getStateStats()
    .slice(0, limit)
    .map(({ slug, info, eventCount, dungeonCount, total }) => ({
      slug,
      name: info.name,
      abbr: info.abbr,
      eventCount,
      dungeonCount,
      total,
    }))
}
