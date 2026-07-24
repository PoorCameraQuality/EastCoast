import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { buildFullSitemapUrls, sitemapXmlFromUrls } from '@/lib/sitemapUrls'
import { getStateSlugsForSitemap } from '@/lib/eastCoastStates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE = 'https://www.eastcoastkinkevents.com'

export async function GET() {
  // Short CDN cache while verifying C2K slug inclusion (raise SWR again after launch SEO sign-off).
  const headers = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
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
