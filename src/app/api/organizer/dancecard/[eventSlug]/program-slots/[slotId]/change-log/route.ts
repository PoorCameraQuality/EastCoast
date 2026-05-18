import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string; slotId: string } },
) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const slotId = context.params.slotId
    const { data, error } = await admin
      .from('dancecard_schedule_change_notifications')
      .select('id, conflict_summary, status, created_at, old_snapshot, new_snapshot')
      .eq('event_id', eventId)
      .eq('program_slot_id', slotId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      entries: (data ?? []).map((row) => ({
        id: row.id,
        summary: row.conflict_summary,
        status: row.status,
        createdAt: row.created_at,
        oldSnapshot: row.old_snapshot,
        newSnapshot: row.new_snapshot,
      })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
