import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

const BASE = "https://www.eastcoastkinkevents.com"
const STATE_SLUGS = [
  "new-york","pennsylvania","new-jersey","maryland","delaware",
  "virginia","north-carolina","south-carolina","georgia","florida",
  "maine","vermont","new-hampshire","massachusetts","rhode-island",
  "connecticut","washington-dc"
]

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

export async function GET() {
  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=86400"
  }

  // Core URLs always present (with sensible defaults) – matches fallback coverage
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
    { loc: `${BASE}/education`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${BASE}/calendar`, changefreq: 'daily', priority: 0.7 },
    { loc: `${BASE}/guidelines`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/states`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${BASE}/vendors`, changefreq: 'weekly', priority: 0.7 }
  ]
  
  // Add all state hub pages
  const stateUrls = STATE_SLUGS.map(s => ({ loc: `${BASE}/states/${s}` }))

  try {
    // Short timeout so we never return 400
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 1500)

    // Fetch events, dungeons, and articles with timeout protection
    const [events, dungeons, articles] = await Promise.all([
      fetch('/api/sitemap/events', { signal: controller.signal }).then(r => r.ok ? r.json() : []),
      fetch('/api/sitemap/dungeons', { signal: controller.signal }).then(r => r.ok ? r.json() : []),
      fetch('/api/sitemap/articles', { signal: controller.signal }).then(r => r.ok ? r.json() : [])
    ]).catch(() => [[], [], []])

    clearTimeout(timer)

    const eventUrls: UrlEntry[] = Array.isArray(events)
      ? events.map((e: any) => ({
          loc: `${BASE}/events/${e.slug}`,
          lastmod: e.updated?.slice(0, 10),
          changefreq: 'weekly',
          priority: 0.8
        }))
      : []
    const dungeonUrls: UrlEntry[] = Array.isArray(dungeons)
      ? dungeons.map((d: any) => ({
          loc: `${BASE}/dungeons/${d.slug}`,
          lastmod: d.updated?.slice(0, 10),
          changefreq: 'monthly',
          priority: 0.6
        }))
      : []
    const articleUrls: UrlEntry[] = Array.isArray(articles)
      ? articles.map((a: any) => ({
          loc: `${BASE}/education/${a.slug}`,
          lastmod: a.updated?.slice(0, 10),
          changefreq: 'monthly',
          priority: 0.5
        }))
      : []

    const body = xml([...core, ...stateUrls, ...eventUrls, ...dungeonUrls, ...articleUrls])
    return new NextResponse(body, { status: 200, headers })
  } catch {
    // Static fallback from public directory
    try {
      const buf = await readFile(path.join(process.cwd(), "public", "sitemap-fallback.xml"))
      return new NextResponse(buf.toString(), { status: 200, headers })
    } catch {
      // Absolute last resort: return minimal valid sitemap
      const body = xml([...core, ...stateUrls])
      return new NextResponse(body, { status: 200, headers })
    }
  }
}
