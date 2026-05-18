import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { isDmStaffRole } from '@/lib/dancecard/dmCoverageScanner'
import { mapStaffShiftRow } from '@/lib/dancecard/organizerStaffShiftDto'
import { organizerStaffShiftPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const SHIFT_SELECT =
  'id, person_name, person_id, role, location_id, starts_at, ends_at, sort_order, shift_status, claimed_by_account_id, organizer_notes_staff_only, dropped_at'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; shiftId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const shiftId = context.params.shiftId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_staff_shifts')
      .select(SHIFT_SELECT)
      .eq('id', shiftId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const body = organizerStaffShiftPatchSchema.parse(await request.json())
    if (body.startsAt !== undefined || body.endsAt !== undefined) {
      assertSlotInsideWindow({
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        startsAt: body.startsAt ?? existing.starts_at,
        endsAt: body.endsAt ?? existing.ends_at,
      })
    }

    const nextRole = body.role ?? (existing.role as string)
    const nextLoc = body.locationId !== undefined ? body.locationId : (existing.location_id as string | null)
    if (isDmStaffRole(nextRole) && !nextLoc) {
      return NextResponse.json({ error: 'DM shifts must set locationId (play space).' }, { status: 400 })
    }

    const patch: Record<string, unknown> = {}
    if (body.personName !== undefined) patch.person_name = body.personName
    if (body.personId !== undefined) patch.person_id = body.personId
    if (body.role !== undefined) patch.role = body.role
    if (body.startsAt !== undefined) patch.starts_at = new Date(body.startsAt).toISOString()
    if (body.endsAt !== undefined) patch.ends_at = new Date(body.endsAt).toISOString()
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder
    if (body.locationId !== undefined) patch.location_id = body.locationId
    if (body.shiftStatus !== undefined) {
      patch.shift_status = body.shiftStatus
      if (body.shiftStatus === 'dropped') {
        patch.dropped_at = new Date().toISOString()
      }
    }
    if (body.organizerNotesStaffOnly !== undefined) patch.organizer_notes_staff_only = body.organizerNotesStaffOnly
    if (body.droppedAt !== undefined) {
      patch.dropped_at = body.droppedAt ? new Date(body.droppedAt).toISOString() : null
    }
    if (body.clearClaimedBy) {
      patch.claimed_by_account_id = null
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: row, error } = await admin
      .from('dancecard_staff_shifts')
      .update(patch)
      .eq('id', shiftId)
      .eq('event_id', eventId)
      .select(SHIFT_SELECT)
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

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; shiftId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const shiftId = context.params.shiftId
    const { data, error } = await admin
      .from('dancecard_staff_shifts')
      .delete()
      .eq('id', shiftId)
      .eq('event_id', eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
