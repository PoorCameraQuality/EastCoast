import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: regRows, error: rErr } = await admin
      .from('dancecard_registrants')
      .select('id')
      .eq('event_id', eventId)
      .neq('status', 'cancelled')
    if (rErr) throw rErr
    const ids = (regRows ?? []).map((r) => r.id as string)

    let acceptanceRowCount = 0
    if (ids.length) {
      const { count, error: aErr } = await admin
        .from('dancecard_registrant_policy_acceptances')
        .select('id', { count: 'exact', head: true })
        .in('registrant_id', ids)
      if (aErr) throw aErr
      acceptanceRowCount = count ?? 0
    }

    return NextResponse.json({
      acceptanceRowCount,
      activeRegistrantCount: ids.length,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
