import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const isoLike = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid ISO datetime')

const patchSchema = z.object({
  locationId: z.string().uuid().optional(),
  startsAt: isoLike.optional(),
  endsAt: isoLike.optional(),
  minLead: z.number().int().min(0).max(99).optional(),
  minFloat: z.number().int().min(0).max(99).optional(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; requirementId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const id = context.params.requirementId
    const body = patchSchema.parse(await request.json())
    const hasField =
      body.locationId !== undefined ||
      body.startsAt !== undefined ||
      body.endsAt !== undefined ||
      body.minLead !== undefined ||
      body.minFloat !== undefined
    if (!hasField) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.locationId !== undefined) patch.location_id = body.locationId
    if (body.startsAt !== undefined) patch.starts_at = new Date(body.startsAt).toISOString()
    if (body.endsAt !== undefined) patch.ends_at = new Date(body.endsAt).toISOString()
    if (body.minLead !== undefined) patch.min_lead = body.minLead
    if (body.minFloat !== undefined) patch.min_float = body.minFloat
    const { data: row, error } = await admin
      .from('dancecard_event_dm_requirements')
      .update(patch)
      .eq('id', id)
      .eq('event_id', eventId)
      .select('id, location_id, starts_at, ends_at, min_lead, min_float')
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      requirement: {
        id: row.id as string,
        locationId: row.location_id as string,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        minLead: Number(row.min_lead),
        minFloat: Number(row.min_float),
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; requirementId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const { error } = await admin
      .from('dancecard_event_dm_requirements')
      .delete()
      .eq('id', context.params.requirementId)
      .eq('event_id', eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
