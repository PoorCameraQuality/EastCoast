import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { isDmStaffRole } from '@/lib/dancecard/dmCoverageScanner'
import { mapStaffShiftRow } from '@/lib/dancecard/organizerStaffShiftDto'
import { organizerStaffShiftCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { fetchStaffShiftRowsForEvent } from '@/lib/dancecard/organizerStaffShiftsData'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { findStaffShiftConflicts } from '@/lib/dancecard/staffShiftConflicts'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const rows = await fetchStaffShiftRowsForEvent(admin, eventId)
    return NextResponse.json({
      shifts: rows.map((r) => mapStaffShiftRow(r)),
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

    const body = organizerStaffShiftCreateSchema.parse(await request.json())
    if (isDmStaffRole(body.role) && !body.locationId) {
      return NextResponse.json({ error: 'DM shifts must set locationId (play space).' }, { status: 400 })
    }
    assertSlotInsideWindow({
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    })

    const startsAt = new Date(body.startsAt).toISOString()
    const endsAt = new Date(body.endsAt).toISOString()
    const existingRows = await fetchStaffShiftRowsForEvent(admin, eventId)
    const shifts = existingRows.map((r) => mapStaffShiftRow(r))
    const conflicts = findStaffShiftConflicts(shifts, {
      personId: body.personId ?? null,
      personName: body.personName.trim(),
      startsAt,
      endsAt,
    })
    if (conflicts.length && !body.overrideConflicts) {
      return NextResponse.json({ error: 'Scheduling conflict', conflicts }, { status: 409 })
    }

    const { count } = await admin
      .from('dancecard_staff_shifts')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const sortOrder = body.sortOrder ?? (typeof count === 'number' ? count : 0)

    const insertRow: Record<string, unknown> = {
      event_id: eventId,
      person_name: body.personName,
      role: body.role,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: sortOrder,
      shift_status: body.shiftStatus ?? 'assigned',
    }
    if (body.personId !== undefined) insertRow.person_id = body.personId
    if (body.locationId !== undefined) insertRow.location_id = body.locationId
    if (body.organizerNotesStaffOnly !== undefined) insertRow.organizer_notes_staff_only = body.organizerNotesStaffOnly

    const { data: row, error } = await admin
      .from('dancecard_staff_shifts')
      .insert(insertRow)
      .select(
        'id, person_name, person_id, role, location_id, starts_at, ends_at, sort_order, shift_status, claimed_by_account_id, organizer_notes_staff_only, dropped_at',
      )
      .single()
    if (error) throw error

    return NextResponse.json({
      shift: mapStaffShiftRow(row as Record<string, unknown>),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
