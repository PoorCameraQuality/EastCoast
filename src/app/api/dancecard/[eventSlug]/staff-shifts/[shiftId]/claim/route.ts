import { NextRequest, NextResponse } from 'next/server'
import { mapStaffShiftRow } from '@/lib/dancecard/organizerStaffShiftDto'
import { fetchStaffShiftRowsForEvent } from '@/lib/dancecard/organizerStaffShiftsData'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { findStaffShiftConflicts } from '@/lib/dancecard/staffShiftConflicts'
import { toClientError } from '@/lib/security/safeApiError'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string; shiftId: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardStaffClaim)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!session.isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const shiftId = context.params.shiftId
    const displayName = session.displayName.trim() || session.username

    const { data: shiftRow, error: loadErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, starts_at, ends_at, shift_status')
      .eq('id', shiftId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (loadErr) throw loadErr
    if (!shiftRow || (shiftRow as { shift_status: string }).shift_status !== 'open') {
      return NextResponse.json({ error: 'Shift is not open for claiming' }, { status: 409 })
    }

    const startsAt = String((shiftRow as { starts_at: string }).starts_at)
    const endsAt = String((shiftRow as { ends_at: string }).ends_at)
    const existingRows = await fetchStaffShiftRowsForEvent(admin, event.id)
    const shifts = existingRows.map((r) => mapStaffShiftRow(r))
    const linkedPersonId =
      shifts.find((s) => s.claimedByAccountId === session.accountId && s.personId)?.personId ?? null
    const conflicts = findStaffShiftConflicts(shifts, {
      personId: linkedPersonId,
      personName: displayName,
      startsAt,
      endsAt,
      excludeShiftId: shiftId,
      claimedByAccountId: session.accountId,
    })
    if (conflicts.length) {
      return NextResponse.json({ error: 'Scheduling conflict', conflicts }, { status: 409 })
    }

    const { data: updated, error } = await admin
      .from('dancecard_staff_shifts')
      .update({
        person_name: displayName,
        claimed_by_account_id: session.accountId,
        shift_status: 'assigned',
        person_id: null,
        dropped_at: null,
      })
      .eq('id', shiftId)
      .eq('event_id', event.id)
      .eq('shift_status', 'open')
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!updated) {
      return NextResponse.json({ error: 'Shift is not open for claiming' }, { status: 409 })
    }
    return NextResponse.json({ ok: true, shiftId: updated.id })
  } catch (e) {
    const { status, body } = toClientError(e, 'staff-shift-claim')
    return NextResponse.json(body, { status })
  }
}
