import { NextRequest, NextResponse } from 'next/server'
import { buildDancecardPublishedProgramIcs } from '@/lib/dancecard/dancecardIcs'
import { filterPublicSlotsForCalendarFeed } from '@/lib/dancecard/filterPublicSlotsForFeed'
import { fetchPublicProgramSlotsForEvent } from '@/lib/dancecard/publicProgramSlotsData'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { hashCalendarFeedSecret } from '@/lib/dancecard/calendarFeedCrypto'

export const dynamic = 'force-dynamic'

function isMissingFeedTable(error: unknown) {
  const e = error as { code?: string; message?: string }
  return e?.code === '42P01' || /dancecard_calendar_feed_tokens|relation .* does not exist/i.test(e?.message ?? '')
}

type CalendarFeedTokenRow = {
  id: string
  event_id: string
  scope: string
  filter_track_id: string | null
  filter_location_id: string | null
  filter_person_id: string | null
  revoked_at: string | null
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const token = request.nextUrl.searchParams.get('token')?.trim()
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 })
    }
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const tokenHash = hashCalendarFeedSecret(token)
    let row: CalendarFeedTokenRow | null = null
    try {
      const { data, error } = await admin
        .from('dancecard_calendar_feed_tokens')
        .select('id, event_id, scope, filter_track_id, filter_location_id, filter_person_id, revoked_at')
        .eq('token_hash', tokenHash)
        .maybeSingle()
      if (error) throw error
      row = data as CalendarFeedTokenRow | null
    } catch (e) {
      if (isMissingFeedTable(e)) {
        return NextResponse.json(
          { error: 'Calendar feeds are not enabled (apply migration dancecard_021_calendar_feed_tokens.sql).' },
          { status: 503 },
        )
      }
      throw e
    }

    if (!row || row.revoked_at || row.event_id !== event.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const slots = await fetchPublicProgramSlotsForEvent(admin, event.id, false)
    const filtered = await filterPublicSlotsForCalendarFeed(
      admin,
      slots,
      row.scope,
      row.filter_track_id,
      row.filter_location_id,
      row.filter_person_id,
    )

    const body = buildDancecardPublishedProgramIcs({
      calendarName: `${event.event_title} — program`,
      eventLabel: event.event_title,
      slots: filtered.map((s) => ({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        title: s.title,
        trackDisplay: s.trackDisplay,
        room: s.room,
        description: s.description,
      })),
    })

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-feeds-ics')
  }
}
