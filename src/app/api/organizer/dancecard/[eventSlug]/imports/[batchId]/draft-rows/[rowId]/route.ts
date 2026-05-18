import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; batchId: string; rowId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const body = await request.json()
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.action !== undefined) patch.action = body.action
    if (body.draftStatus !== undefined) patch.draft_status = body.draftStatus
    if (body.title !== undefined) patch.title = body.title || null
    if (body.personName !== undefined) patch.person_name = body.personName || null
    if (body.role !== undefined) patch.role = body.role || null
    if (body.track !== undefined) patch.track = body.track || null
    if (body.room !== undefined) patch.room = body.room || null
    if (body.locationId !== undefined) patch.location_id = body.locationId || null
    if (body.startsAt !== undefined) patch.starts_at = body.startsAt ? new Date(body.startsAt).toISOString() : null
    if (body.endsAt !== undefined) patch.ends_at = body.endsAt ? new Date(body.endsAt).toISOString() : null
    if (body.durationMinutes !== undefined) patch.duration_minutes = body.durationMinutes
    if (body.description !== undefined) patch.description = body.description || null
    if (body.sortOrder !== undefined) patch.sort_order = Number(body.sortOrder)

    const { data, error } = await admin
      .from('dancecard_import_rows')
      .update(patch)
      .eq('id', context.params.rowId)
      .eq('batch_id', context.params.batchId)
      .eq('event_id', eventId)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ row: data })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
