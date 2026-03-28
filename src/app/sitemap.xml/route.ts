import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { supabase } from "@/lib/supabase"
import { getStateSlugsForSitemap } from "@/lib/eastCoastStates"

export const runtime = "nodejs"

const BASE = "https://www.eastcoastkinkevents.com"

// XML escaping function for safety
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// Simple XML builder for sitemap with safety hardening
type UrlEntry = { loc: string; lastmod?: string; changefreq?: string; priority?: number }
function xml(urls: UrlEntry[]) {
  const body = urls
    .map(u => {
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""
      const priority = typeof u.priority === 'number' ? `<priority>${u.priority.toFixed(1)}</priority>` : ""
      return `<url><loc>${esc(u.loc)}</loc>${lastmod}${changefreq}${priority}</url>`
    })
    .join("")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
}

async function getSitemapData() {
  const today = new Date().toISOString().slice(0, 10)
  let events: Array<{ slug: string; updated?: string }> = []
  let dungeons: Array<{ slug: string; updated?: string }> = []
  let articles: Array<{ slug: string; updated?: string }> = []
  let vendors: Array<{ slug: string }> = []

  try {
    const [{ getAllEvents }, { getAllDungeons }, { getAllArticles }, { getAllVendors }] = await Promise.all([
      import("@/data/events"),
      import("@/data/dungeons"),
      import("@/data/education"),
      import("@/data/vendors")
    ])
    const allEvents = getAllEvents?.() || []
    const allDungeons = getAllDungeons?.() || []
    const allVendors = getAllVendors?.() || []

    events = allEvents
      .filter((e: any) => e?.slug)
      .map((e: any) => ({ slug: e.slug, updated: e.date?.start?.slice?.(0, 10) }))
    dungeons = allDungeons
      .filter((d: any) => d?.slug)
      .map((d: any) => ({ slug: d.slug, updated: (d as any).updated_at || (d as any).updated || today }))
    vendors = (allVendors || [])
      .filter((v: any) => v?.slug)
      .map((v: any) => ({ slug: v.slug }))

    // Fetch articles from Supabase first (26+ articles); fallback to static education.js if Supabase returns empty
    const client = supabase
    if (client) {
      const { data: supabaseArticles, error } = await client
        .from('articles')
        .select('slug, publish_date, last_updated, updated_at')
        .eq('status', 'published')
        .order('publish_date', { ascending: false })
      if (!error && supabaseArticles?.length) {
        articles = supabaseArticles.map((a: any) => ({
          slug: a.slug,
          updated: (a.last_updated || a.updated_at || a.publish_date || '').toString().slice(0, 10)
        }))
      }
    }
    if (articles.length === 0) {
      const staticArticles = getAllArticles?.() || []
      articles = staticArticles
        .filter((a: any) => a?.slug && a?.status === 'published')
        .map((a: any) => ({ slug: a.slug, updated: (a.lastUpdated || a.publishDate || '').toString().slice(0, 10) }))
    }
  } catch (err) {
    console.error('[Sitemap] Error loading data:', err)
  }

  return { events, dungeons, articles, vendors, today }
}

export async function GET() {
  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=86400"
  }

  const today = new Date().toISOString().slice(0, 10)
  const core: UrlEntry[] = [
    { loc: `${BASE}/`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { loc: `${BASE}/about`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/accessibility`, changefreq: 'monthly', priority: 0.4 },
    { loc: `${BASE}/contact`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/privacy`, changefreq: 'monthly', priority: 0.3 },
    { loc: `${BASE}/terms`, changefreq: 'monthly', priority: 0.3 },
    { loc: `${BASE}/support`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/report`, changefreq: 'monthly', priority: 0.4 },
    { loc: `${BASE}/events`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${BASE}/dungeons`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${BASE}/education`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${BASE}/calendar`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${BASE}/guidelines`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/states`, changefreq: 'weekly', priority: 0.5 },
    { loc: `${BASE}/vendors`, changefreq: 'weekly', priority: 0.7 }
  ]

  const stateUrls: UrlEntry[] = getStateSlugsForSitemap().map((s) => ({
    loc: `${BASE}/states/${s}`,
    lastmod: today,
    changefreq: 'weekly' as const,
    priority: 0.6
  }))

  try {
    const { events, dungeons, articles, vendors } = await getSitemapData()

    const eventUrls: UrlEntry[] = events.map((e) => ({
      loc: `${BASE}/events/${e.slug}`,
      lastmod: e.updated?.slice(0, 10),
      changefreq: 'weekly' as const,
      priority: 0.8
    }))

    const dungeonUrls: UrlEntry[] = dungeons.map((d) => ({
      loc: `${BASE}/dungeons/${d.slug}`,
      lastmod: d.updated?.slice(0, 10),
      changefreq: 'monthly' as const,
      priority: 0.6
    }))
    const articleUrls: UrlEntry[] = articles.map((a) => ({
      loc: `${BASE}/education/${a.slug}`,
      lastmod: a.updated?.slice(0, 10),
      changefreq: 'monthly' as const,
      priority: 0.5
    }))
    const vendorUrls: UrlEntry[] = vendors.map((v) => ({
      loc: `${BASE}/vendors/${v.slug}`,
      lastmod: today,
      changefreq: 'monthly' as const,
      priority: 0.5
    }))

    const body = xml([...core, ...stateUrls, ...eventUrls, ...dungeonUrls, ...articleUrls, ...vendorUrls])
    return new NextResponse(body, { status: 200, headers })
  } catch {
    try {
      const buf = await readFile(path.join(process.cwd(), "public", "sitemap-fallback.xml"))
      return new NextResponse(buf.toString(), { status: 200, headers })
    } catch {
      const body = xml([...core, ...stateUrls])
      return new NextResponse(body, { status: 200, headers })
    }
  }
}
