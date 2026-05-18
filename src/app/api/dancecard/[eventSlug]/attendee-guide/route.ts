import { NextRequest, NextResponse } from 'next/server'
import { publicAttendeeGuideJson, parseAttendeeGuideJson } from '@/lib/dancecard/attendeeGuideJson'
import { parseEventProfile } from '@/lib/dancecard/eventProfile'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const row = event as Record<string, unknown>
    const guide = parseAttendeeGuideJson(row.attendee_guide_json)
    return NextResponse.json({
      eventTitle: event.event_title,
      eventProfile: parseEventProfile(row.event_profile),
      guide: publicAttendeeGuideJson(guide),
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-attendee-guide')
  }
}
