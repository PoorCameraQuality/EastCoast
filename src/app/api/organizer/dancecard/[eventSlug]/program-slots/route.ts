import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerProgramSlotCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { fetchOrganizerProgramSlotById, fetchOrganizerProgramSlotsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const slots = await fetchOrganizerProgramSlotsForEvent(admin, eventId)
    return NextResponse.json({
      slots,
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      timezone: event.timezone,
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

    const body = organizerProgramSlotCreateSchema.parse(await request.json())
    if (body.startsAt != null && body.endsAt != null) {
      assertSlotInsideWindow({
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
      })
    }

    const { count } = await admin
      .from('dancecard_program_slots')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const sortOrder = body.sortOrder ?? (typeof count === 'number' ? count : 0)

    const insertRow: Record<string, unknown> = {
      event_id: eventId,
      starts_at: body.startsAt != null ? new Date(body.startsAt).toISOString() : null,
      ends_at: body.endsAt != null ? new Date(body.endsAt).toISOString() : null,
      title: body.title,
      track: body.track ?? null,
      room: body.room ?? null,
      location_id: body.locationId ?? null,
      description: body.description ?? null,
      sort_order: sortOrder,
    }
    if (body.trackId !== undefined) insertRow.track_id = body.trackId
    if (body.isPublished !== undefined) insertRow.is_published = body.isPublished
    if (body.visibility !== undefined) insertRow.visibility = body.visibility
    if (body.isFrozen !== undefined) insertRow.is_frozen = body.isFrozen

    const { data: row, error } = await admin.from('dancecard_program_slots').insert(insertRow).select('id').single()
    if (error) throw error

    const dto = await fetchOrganizerProgramSlotById(admin, eventId, row.id as string)
    if (!dto) throw new Error('Could not load created slot')

    return NextResponse.json({ slot: dto })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
