import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerTagPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; tagId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerTagPatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = {}
    if (body.name !== undefined) patch.name = body.name.trim()
    if (body.scope !== undefined) patch.scope = body.scope
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    const { data: row, error } = await admin
      .from('dancecard_tags')
      .update(patch)
      .eq('id', context.params.tagId)
      .eq('event_id', eventId)
      .select('id, name, scope')
      .maybeSingle()
    if (error) throw error
    if (!row) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }
    return NextResponse.json({
      tag: { id: row.id, name: row.name, scope: row.scope },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; tagId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const { data, error } = await admin
      .from('dancecard_tags')
      .delete()
      .eq('id', context.params.tagId)
      .eq('event_id', eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
