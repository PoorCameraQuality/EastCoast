import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerTrackPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; trackId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerTrackPatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = {}
    if (body.name !== undefined) patch.name = body.name.trim()
    if (body.color !== undefined) patch.color = body.color
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    const { data: row, error } = await admin
      .from('dancecard_tracks')
      .update(patch)
      .eq('id', context.params.trackId)
      .eq('event_id', eventId)
      .select('id, name, color, sort_order')
      .maybeSingle()
    if (error) throw error
    if (!row) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    return NextResponse.json({
      track: { id: row.id, name: row.name, color: row.color, sortOrder: row.sort_order },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; trackId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const { data, error } = await admin
      .from('dancecard_tracks')
      .delete()
      .eq('id', context.params.trackId)
      .eq('event_id', eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
