import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getAllArticles } from '@/data/education'
import { getAllVendors } from '@/data/vendors'
import { supabase } from '@/lib/supabase'

export type HubCategoryCounts = {
  events: number
  dungeons: number
  articles: number
  vendors: number
}

/**
 * Counts for homepage hub cards — always uses live event/dungeon/vendor data;
 * article count prefers Supabase published total when configured.
 */
export async function getHubCategoryCounts(): Promise<HubCategoryCounts> {
  const events = getAllEvents().length
  const dungeons = getAllDungeons().length
  const vendors = getAllVendors().length
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
