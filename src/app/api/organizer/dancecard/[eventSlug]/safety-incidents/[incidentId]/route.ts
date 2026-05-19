import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRoleCanEditVettingSafetyNotes } from '@/lib/dancecard/organizerRoles'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  summary: z.string().min(1).max(4000).optional(),
  safetyNotes: z.string().max(8000).nullable().optional(),
  status: z.enum(['open', 'reviewing', 'closed']).optional(),
  locationId: z.string().uuid().nullable().optional(),
  locationLabel: z.string().max(500).nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; incidentId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, organizerRole } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = patchSchema.parse(await request.json())
    const includeSafety = organizerRoleCanEditVettingSafetyNotes(organizerRole)
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.summary !== undefined) patch.summary = body.summary
    if (body.status !== undefined) patch.status = body.status
    if (body.locationId !== undefined) patch.location_id = body.locationId
    if (body.locationLabel !== undefined) patch.location_label = body.locationLabel
    if (body.safetyNotes !== undefined && includeSafety) patch.safety_notes = body.safetyNotes

    const { data, error } = await admin
      .from('dancecard_safety_incidents')
      .update(patch)
      .eq('id', context.params.incidentId)
      .eq('event_id', eventId)
      .select('*')
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      incident: {
        id: data.id,
        summary: data.summary,
        safetyNotes: includeSafety ? data.safety_notes : null,
        status: data.status,
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
