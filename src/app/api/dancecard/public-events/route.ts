import { NextResponse } from 'next/server'
import {getDancecardAdmin, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
  try {
    const admin = getDancecardAdmin()
    const { data, error } = await admin
      .from('dancecard_events')
      .select('slug, event_title, timezone, window_starts_at, window_ends_at')
      .eq('status', 'published')
      .order('window_starts_at', { ascending: true })

    if (error) {
      console.error('[public-events]', error.message)
      return NextResponse.json({ error: 'Unable to load events' }, { status: 503 })
    }

    const events = (data ?? []).map((row) => ({
      slug: row.slug,
      eventTitle: row.event_title,
      timezone: row.timezone,
      startsAt: row.window_starts_at,
      endsAt: row.window_ends_at,
    }))

    return NextResponse.json(
      { events },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[public-events]', msg)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
