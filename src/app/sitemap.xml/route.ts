import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { buildFullSitemapUrls, sitemapXmlFromUrls } from '@/lib/sitemapUrls'
import { getStateSlugsForSitemap } from '@/lib/eastCoastStates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE = 'https://www.eastcoastkinkevents.com'

export async function GET() {
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400',
  }

  const today = new Date().toISOString().slice(0, 10)
  const minimalFallback = sitemapXmlFromUrls([
    { loc: `${BASE}/`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    ...getStateSlugsForSitemap().map((s) => ({
      loc: `${BASE}/states/${s}`,
      lastmod: today,
      changefreq: 'weekly' as const,
      priority: 0.6,
    })),
  ])

  try {
    const urls = await buildFullSitemapUrls()
    return new NextResponse(sitemapXmlFromUrls(urls), { status: 200, headers })
  } catch {
    try {
      const buf = await readFile(path.join(process.cwd(), 'public', 'sitemap-fallback.xml'))
      return new NextResponse(buf.toString(), { status: 200, headers })
    } catch {
      return new NextResponse(minimalFallback, { status: 200, headers })
    }
  }
}
