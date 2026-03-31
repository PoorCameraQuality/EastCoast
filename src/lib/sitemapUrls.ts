import { supabase } from '@/lib/supabase'
import { getStateSlugsForSitemap } from '@/lib/eastCoastStates'
import { buildAllowlistedDiscoveryPaths } from '@/lib/discoveryTier'
import { buildAllowlistedVendorDiscoveryPaths } from '@/lib/vendorDiscoveryTier'
import { buildAllowlistedDungeonDiscoveryPaths } from '@/lib/dungeonDiscoveryTier'
import { buildAllowlistedBlogPaths } from '@/lib/blogDiscoveryTier'

const BASE = 'https://www.eastcoastkinkevents.com'

export type SitemapUrlEntry = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

async function loadSitemapEntities() {
  const today = new Date().toISOString().slice(0, 10)
  let events: Array<{ slug: string; updated?: string }> = []
  let dungeons: Array<{ slug: string; updated?: string }> = []
  let articles: Array<{ slug: string; updated?: string }> = []
  let vendors: Array<{ slug: string }> = []

  try {
    const [{ getAllEvents }, { getAllDungeons }, { getAllArticles }, { getUnifiedVendors }] = await Promise.all([
      import('@/data/events'),
      import('@/data/dungeons'),
      import('@/data/education'),
      import('@/lib/unifiedVendors'),
    ])
    const allEvents = getAllEvents?.() || []
    const allDungeons = getAllDungeons?.() || []
    const allVendors = (await getUnifiedVendors?.()) || []

    events = allEvents
      .filter((e: { slug?: string }) => e?.slug)
      .map((e: { slug: string; date?: { start?: string } }) => ({
        slug: e.slug,
        updated: e.date?.start?.slice?.(0, 10),
      }))
    dungeons = allDungeons
      .filter((d: { slug?: string }) => d?.slug)
      .map((d: Record<string, unknown>) => ({
        slug: String(d.slug),
        updated: String(
          (d as { updated_at?: string }).updated_at ||
            (d as { updated?: string }).updated ||
            today
        ),
      }))
    vendors = allVendors
      .filter((v: { slug?: string }) => v?.slug)
      .map((v: { slug: string }) => ({ slug: v.slug }))

    const client = supabase
    if (client) {
      const { data: supabaseArticles, error } = await client
        .from('articles')
        .select('slug, publish_date, last_updated, updated_at')
        .eq('status', 'published')
        .order('publish_date', { ascending: false })
      if (!error && supabaseArticles?.length) {
        articles = supabaseArticles.map((a: Record<string, unknown>) => ({
          slug: String(a.slug),
          updated: String(
            a.last_updated || a.updated_at || a.publish_date || ''
          ).slice(0, 10),
        }))
      }
    }
    if (articles.length === 0) {
      const staticArticles = getAllArticles?.() || []
      articles = staticArticles
        .filter((a: { slug?: string; status?: string }) => a?.slug && a?.status === 'published')
        .map((a: Record<string, unknown>) => ({
          slug: String(a.slug),
          updated: String(a.lastUpdated || a.publishDate || '').slice(0, 10),
        }))
    }
  } catch (err) {
    console.error('[sitemapUrls] Error loading data:', err)
  }

  return { events, dungeons, articles, vendors }
}

/** High-value directory and content URLs (events, venues, education, hubs). */
export async function buildDirectorySitemapUrls(): Promise<SitemapUrlEntry[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { events, dungeons, articles, vendors } = await loadSitemapEntities()

  const core: SitemapUrlEntry[] = [
    { loc: `${BASE}/`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { loc: `${BASE}/events`, changefreq: 'weekly', priority: 0.85 },
    { loc: `${BASE}/dungeons`, changefreq: 'weekly', priority: 0.85 },
    { loc: `${BASE}/education`, changefreq: 'weekly', priority: 0.65 },
    { loc: `${BASE}/calendar`, changefreq: 'weekly', priority: 0.72 },
    { loc: `${BASE}/states`, changefreq: 'weekly', priority: 0.55 },
    { loc: `${BASE}/bdsm-events`, changefreq: 'weekly', priority: 0.72 },
    { loc: `${BASE}/vendors`, changefreq: 'weekly', priority: 0.68 },
    { loc: `${BASE}/blog`, changefreq: 'weekly', priority: 0.62 },
  ]

  const stateUrls: SitemapUrlEntry[] = getStateSlugsForSitemap().map((s) => ({
    loc: `${BASE}/states/${s}`,
    lastmod: today,
    changefreq: 'weekly' as const,
    priority: 0.62,
  }))

  const eventUrls: SitemapUrlEntry[] = events.map((e) => ({
    loc: `${BASE}/events/${e.slug}`,
    lastmod: e.updated?.slice(0, 10),
    changefreq: 'weekly' as const,
    priority: 0.82,
  }))

  const dungeonUrls: SitemapUrlEntry[] = dungeons.map((d) => ({
    loc: `${BASE}/dungeons/${d.slug}`,
    lastmod: d.updated?.slice(0, 10),
    changefreq: 'monthly' as const,
    priority: 0.65,
  }))

  const articleUrls: SitemapUrlEntry[] = articles.map((a) => ({
    loc: `${BASE}/education/${a.slug}`,
    lastmod: a.updated?.slice(0, 10),
    changefreq: 'monthly' as const,
    priority: 0.52,
  }))

  const vendorUrls: SitemapUrlEntry[] = vendors.map((v) => ({
    loc: `${BASE}/vendors/${v.slug}`,
    lastmod: today,
    changefreq: 'monthly' as const,
    priority: 0.52,
  }))

  const discoveryPaths = buildAllowlistedDiscoveryPaths()
  const discoveryUrls: SitemapUrlEntry[] = discoveryPaths.map((p) => ({
    loc: `${BASE}/${p}`,
    lastmod: today,
    changefreq: 'weekly' as const,
    priority: 0.64,
  }))

  const vendorDiscoveryPaths = buildAllowlistedVendorDiscoveryPaths()
  const vendorDiscoveryUrls: SitemapUrlEntry[] = vendorDiscoveryPaths.map((p) => ({
    loc: `${BASE}/${p}`,
    lastmod: today,
    changefreq: 'weekly' as const,
    priority: 0.62,
  }))

  const dungeonDiscoveryPaths = buildAllowlistedDungeonDiscoveryPaths()
  const dungeonDiscoveryUrls: SitemapUrlEntry[] = dungeonDiscoveryPaths.map((p) => ({
    loc: `${BASE}/${p}`,
    lastmod: today,
    changefreq: 'weekly' as const,
    priority: 0.62,
  }))

  const blogPaths = buildAllowlistedBlogPaths()
  const blogUrls: SitemapUrlEntry[] = blogPaths.map((p) => ({
    loc: `${BASE}/${p}`,
    lastmod: today,
    changefreq: 'weekly' as const,
    priority: 0.58,
  }))

  return [
    ...core,
    ...stateUrls,
    ...discoveryUrls,
    ...vendorDiscoveryUrls,
    ...dungeonDiscoveryUrls,
    ...blogUrls,
    ...eventUrls,
    ...dungeonUrls,
    ...articleUrls,
    ...vendorUrls,
  ]
}

/** Full site sitemap: directory URLs plus policies, support, and utility pages. */
export async function buildFullSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const main = await buildDirectorySitemapUrls()
  const today = new Date().toISOString().slice(0, 10)
  const legal: SitemapUrlEntry[] = [
    { loc: `${BASE}/about`, lastmod: today, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/accessibility`, changefreq: 'monthly', priority: 0.4 },
    { loc: `${BASE}/contact`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/privacy`, changefreq: 'monthly', priority: 0.3 },
    { loc: `${BASE}/terms`, changefreq: 'monthly', priority: 0.3 },
    { loc: `${BASE}/support`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/report`, changefreq: 'monthly', priority: 0.4 },
    { loc: `${BASE}/guidelines`, changefreq: 'monthly', priority: 0.5 },
  ]
  return [...main, ...legal]
}

export function sitemapXmlFromUrls(urls: SitemapUrlEntry[]): string {
  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''
      const priority =
        typeof u.priority === 'number' ? `<priority>${u.priority.toFixed(1)}</priority>` : ''
      return `<url><loc>${esc(u.loc)}</loc>${lastmod}${changefreq}${priority}</url>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
}
