import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const isoLike = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid ISO datetime')

const bodySchema = z.object({
  locationId: z.string().uuid(),
  startsAt: isoLike,
  endsAt: isoLike,
  minLead: z.number().int().min(0).max(99).optional(),
  minFloat: z.number().int().min(0).max(99).optional(),
})

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_event_dm_requirements')
      .select('id, location_id, starts_at, ends_at, min_lead, min_float')
      .eq('event_id', eventId)
      .order('starts_at', { ascending: true })
    if (error) throw error
    return NextResponse.json({
      requirements: (rows ?? []).map((r) => ({
        id: r.id as string,
        locationId: r.location_id as string,
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        minLead: Number(r.min_lead ?? 1),
        minFloat: Number(r.min_float ?? 0),
      })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = bodySchema.parse(await request.json())
    const { data: row, error } = await admin
      .from('dancecard_event_dm_requirements')
      .insert({
        event_id: eventId,
        location_id: body.locationId,
        starts_at: new Date(body.startsAt).toISOString(),
        ends_at: new Date(body.endsAt).toISOString(),
        min_lead: body.minLead ?? 1,
        min_float: body.minFloat ?? 0,
      })
      .select('id, location_id, starts_at, ends_at, min_lead, min_float')
      .single()
    if (error) throw error
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
