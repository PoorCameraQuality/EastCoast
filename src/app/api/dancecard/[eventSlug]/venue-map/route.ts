import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug } from '@/lib/dancecard/routeCommon'
import { fetchSignedVenueMapsForEvent } from '@/lib/dancecard/venueMapsSigned'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const event = await loadEventBySlug(admin, context.params.eventSlug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const maps = await fetchSignedVenueMapsForEvent(admin, event.id, 20)
    return NextResponse.json(
      { maps, eventTitle: event.event_title },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      },
    )
  } catch {
    return NextResponse.json({ maps: [] })
  }
}
