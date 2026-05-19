import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRoleCanEditVettingSafetyNotes } from '@/lib/dancecard/organizerRoles'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  summary: z.string().min(1).max(4000),
  safetyNotes: z.string().max(8000).optional(),
  locationId: z.string().uuid().nullable().optional(),
  locationLabel: z.string().max(500).optional(),
  involvedRegistrantIds: z.array(z.string().uuid()).optional(),
  involvedPersonIds: z.array(z.string().uuid()).optional(),
  reportedAt: z.string().datetime().optional(),
})

function mapRow(r: Record<string, unknown>, includeSafetyNotes: boolean) {
  return {
    id: r.id as string,
    reportedAt: r.reported_at as string,
    locationId: (r.location_id as string | null) ?? null,
    locationLabel: (r.location_label as string | null) ?? null,
    involvedRegistrantIds: (r.involved_registrant_ids as string[]) ?? [],
    involvedPersonIds: (r.involved_person_ids as string[]) ?? [],
    summary: r.summary as string,
    safetyNotes: includeSafetyNotes ? ((r.safety_notes as string | null) ?? null) : null,
    status: r.status as string,
    createdByUserId: (r.created_by_user_id as string | null) ?? null,
    updatedAt: r.updated_at as string,
  }
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId, organizerRole } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const includeSafety = organizerRoleCanEditVettingSafetyNotes(organizerRole)
    const { data, error } = await admin
      .from('dancecard_safety_incidents')
      .select('*')
      .eq('event_id', eventId)
      .order('reported_at', { ascending: false })
      .limit(200)
    if (error) throw error

    return NextResponse.json({
      incidents: (data ?? []).map((r) => mapRow(r as Record<string, unknown>, includeSafety)),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, organizerRole, userId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = createSchema.parse(await request.json())
    const includeSafety = organizerRoleCanEditVettingSafetyNotes(organizerRole)

    const { data, error } = await admin
      .from('dancecard_safety_incidents')
      .insert({
        event_id: eventId,
        summary: body.summary.trim(),
        safety_notes: includeSafety ? body.safetyNotes?.trim() ?? null : null,
        location_id: body.locationId ?? null,
        location_label: body.locationLabel?.trim() ?? null,
        involved_registrant_ids: body.involvedRegistrantIds ?? [],
        involved_person_ids: body.involvedPersonIds ?? [],
        reported_at: body.reportedAt ?? new Date().toISOString(),
        created_by_user_id: userId,
      })
      .select('*')
      .single()
    if (error) throw error

    return NextResponse.json({ incident: mapRow(data as Record<string, unknown>, includeSafety) })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
