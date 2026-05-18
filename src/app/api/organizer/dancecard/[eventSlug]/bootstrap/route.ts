import { NextRequest, NextResponse } from 'next/server'
import { fetchOrganizerBootstrap } from '@/lib/dancecard/organizerBootstrap'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  const t0 = Date.now()
  try {
    const { admin, eventId, organizerRole } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = await fetchOrganizerBootstrap(admin, organizerRole, event)
    const res = NextResponse.json(body)
    if (process.env.NODE_ENV === 'development') {
      res.headers.set('Server-Timing', `bootstrap;dur=${Date.now() - t0}`)
    }
    return res
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
