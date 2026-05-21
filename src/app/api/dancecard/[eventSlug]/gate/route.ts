import { NextResponse } from 'next/server'
import { getEventEntitlements } from '@/lib/dancecard/eventEntitlements'
import { parseEventProfile } from '@/lib/dancecard/eventProfile'
import { allowPublicAttendeeDemoAccess } from '@/lib/dancecard/publicDemo'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const { data: row, error } = await admin
      .from('dancecard_events')
      .select('registration_access_code, event_profile')
      .eq('id', event.id)
      .maybeSingle()
    if (error) throw error
    const code = String((row as { registration_access_code?: string } | null)?.registration_access_code ?? '').trim()
    const modules = await getEventEntitlements(admin, event.id)
    const publicDemo = allowPublicAttendeeDemoAccess(slug)
    return NextResponse.json({
      requiresRegistrationCode: publicDemo ? false : code.length > 0,
      modules,
      eventProfile: parseEventProfile((row as { event_profile?: string } | null)?.event_profile),
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-gate')
  }
}
