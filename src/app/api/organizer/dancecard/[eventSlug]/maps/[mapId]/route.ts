import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  context: { params: { eventSlug: string; mapId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { error } = await admin
      .from('dancecard_event_maps')
      .delete()
      .eq('id', context.params.mapId)
      .eq('event_id', eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
