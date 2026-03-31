import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getAllArticles } from '@/data/education'
import { supabase } from '@/lib/supabase'
import { getUnifiedVendors } from '@/lib/unifiedVendors'

export type HubCategoryCounts = {
  events: number
  dungeons: number
  articles: number
  vendors: number
}

type HubCountsOpts = {
  /** When set, skips a second getUnifiedVendors() call (e.g. home page already loaded vendors). */
  vendorCount?: number
}

/**
 * Counts for homepage hub cards — always uses live event/dungeon/vendor data;
 * article count prefers Supabase published total when configured.
 * Vendor count uses merged static + Supabase catalog.
 */
export async function getHubCategoryCounts(opts?: HubCountsOpts): Promise<HubCategoryCounts> {
  const events = getAllEvents().length
  const dungeons = getAllDungeons().length
  const vendors =
    typeof opts?.vendorCount === 'number'
      ? opts.vendorCount
      : (await getUnifiedVendors()).length
  let articles = getAllArticles().length

  if (supabase) {
    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    if (!error && typeof count === 'number' && count >= 0) {
      articles = count
    }
  }

  return { events, dungeons, articles, vendors }
}
