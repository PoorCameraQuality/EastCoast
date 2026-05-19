import { NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string; slotId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const slotId = context.params.slotId
    const { data: slotRow, error: slotErr } = await admin
      .from('dancecard_program_slots')
      .select('id')
      .eq('id', slotId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (slotErr) throw slotErr
    if (!slotRow) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

    const { data, error } = await admin
      .from('dancecard_program_slot_audit')
      .select('id, action, before_json, after_json, actor_user_id, created_at')
      .eq('event_id', eventId)
      .eq('slot_id', slotId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error

    return NextResponse.json({
      entries: (data ?? []).map((r) => ({
        id: r.id,
        action: r.action,
        createdAt: r.created_at,
        actorUserId: r.actor_user_id,
        before: r.before_json,
        after: r.after_json,
      })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
