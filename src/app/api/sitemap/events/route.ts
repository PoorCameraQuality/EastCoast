import { NextResponse } from 'next/server'
import { fetchPublishedEventSlugsForSitemap } from '@/lib/unifiedEvents'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { events } = await import('@/data/events')
    const bySlug = new Map<string, { slug: string; updated: string | null }>()

    for (const event of events || []) {
      if (!event?.slug) continue
      bySlug.set(event.slug, {
        slug: event.slug,
        updated: event.date?.start || null,
      })
    }

    const published = await fetchPublishedEventSlugsForSitemap()
    for (const row of published) {
      bySlug.set(row.slug, {
        slug: row.slug,
        updated: row.updated || null,
      })
    }

    return NextResponse.json(Array.from(bySlug.values()), { status: 200 })
  } catch (error) {
    console.error('[Sitemap API] Error importing events:', error)
    return NextResponse.json([], { status: 200 })
  }
}
