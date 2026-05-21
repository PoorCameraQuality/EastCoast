import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getUnifiedVendors } from '@/lib/unifiedVendors'

export type HubCategoryCounts = {
  events: number
  dungeons: number
  vendors: number
}

type HubCountsOpts = {
  /** When set, skips a second getUnifiedVendors() call (e.g. home page already loaded vendors). */
  vendorCount?: number
}

/**
 * Counts for homepage hub cards — live event/dungeon/vendor data.
 */
export async function getHubCategoryCounts(opts?: HubCountsOpts): Promise<HubCategoryCounts> {
  const events = getAllEvents().length
  const dungeons = getAllDungeons().length
  const vendors =
    typeof opts?.vendorCount === 'number'
      ? opts.vendorCount
      : (await getUnifiedVendors()).length

  return { events, dungeons, vendors }
}
