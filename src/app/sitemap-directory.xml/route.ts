import { NextResponse } from 'next/server'
import { buildDirectorySitemapUrls, sitemapXmlFromUrls } from '@/lib/sitemapUrls'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const urls = await buildDirectorySitemapUrls()
  const body = sitemapXmlFromUrls(urls)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
