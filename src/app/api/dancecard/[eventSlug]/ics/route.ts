import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { loadPrefs, loadSelections } from '@/lib/dancecard/data'
import { buildDancecardSelectionsOnlyIcs } from '@/lib/dancecard/dancecardIcs'

export const dynamic = 'force-dynamic'

function safeFilenamePart(s: string) {
  return s.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'dancecard'
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const [rows, prefs] = await Promise.all([
      loadSelections(admin, session.accountId),
      loadPrefs(admin, session.accountId),
    ])
    const selections = rows.map((s) => ({
      id: s.id,
      kind: s.kind,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      programTitle: s.program_title,
      programRoom: s.program_room,
      note: s.note,
    }))

    const body = buildDancecardSelectionsOnlyIcs({
      calendarName: 'Dancecard',
      attendeeDisplayName: session.displayName,
      selections,
      programRemindBeforeMinutes: prefs.icsRemindBeforeMinutes,
    })

    const fn = `dancecard-${slug}-${safeFilenamePart(session.username)}.ics`
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fn}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-ics')
  }
}
