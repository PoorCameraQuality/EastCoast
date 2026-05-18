import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { isDmStaffRole } from '@/lib/dancecard/dmCoverageScanner'
import { mapStaffShiftRow } from '@/lib/dancecard/organizerStaffShiftDto'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { fetchStaffShiftRowsForEvent } from '@/lib/dancecard/organizerStaffShiftsData'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { findStaffShiftConflicts } from '@/lib/dancecard/staffShiftConflicts'
import {
  appendStaffShiftToDancecard,
  notifyStaffShiftAssigned,
  resolveAccountIdForStaffPerson,
} from '@/lib/dancecard/staffShiftAssignEffects'
import { formatInTimeZone } from 'date-fns-tz'

export const dynamic = 'force-dynamic'

const assignCoverageSchema = z.object({
  personName: z.string().min(1).max(200),
  personId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  role: z.string().min(1).max(120).optional(),
  overrideConflicts: z.boolean().optional(),
})

function inferDmRole(existing: { role: string }[]): string {
  for (const s of existing) {
    if (isDmStaffRole(s.role)) return s.role
  }
  return 'dungeon_monitor'
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

    const body = assignCoverageSchema.parse(await request.json())
    const startsAt = new Date(body.startsAt).toISOString()
    const endsAt = new Date(body.endsAt).toISOString()

    assertSlotInsideWindow({
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      startsAt,
      endsAt,
    })

    const rows = await fetchStaffShiftRowsForEvent(admin, eventId)
    const shifts = rows.map((r) => mapStaffShiftRow(r))

    const personShifts = shifts.filter((s) =>
      body.personId ? s.personId === body.personId : s.personName === body.personName,
    )
    const role = body.role ?? inferDmRole(personShifts)

    const conflicts = findStaffShiftConflicts(shifts, {
      personId: body.personId ?? null,
      personName: body.personName,
      startsAt,
      endsAt,
    })

    if (conflicts.length && !body.overrideConflicts) {
      return NextResponse.json(
        {
          error: 'Scheduling conflict',
          conflicts,
        },
        { status: 409 },
      )
    }

    const { count } = await admin
      .from('dancecard_staff_shifts')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const sortOrder = typeof count === 'number' ? count : 0

    const accountId = await resolveAccountIdForStaffPerson(
      admin,
      eventId,
      { personId: body.personId ?? null, personName: body.personName },
      shifts,
    )

    const insertRow: Record<string, unknown> = {
      event_id: eventId,
      person_name: body.personName.trim(),
      role,
      location_id: body.locationId,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: sortOrder,
      shift_status: 'assigned',
    }
    if (body.personId !== undefined) insertRow.person_id = body.personId
    if (accountId) insertRow.claimed_by_account_id = accountId

    const { data: row, error } = await admin
      .from('dancecard_staff_shifts')
      .insert(insertRow)
      .select(
        'id, person_name, person_id, role, location_id, starts_at, ends_at, sort_order, shift_status, claimed_by_account_id, organizer_notes_staff_only, dropped_at',
      )
      .single()
    if (error) throw error

    const shift = mapStaffShiftRow(row as Record<string, unknown>)

    let dancecardSynced = false
    let notified = false
    if (accountId) {
      dancecardSynced = await appendStaffShiftToDancecard(admin, accountId, { startsAt, endsAt })
      const tz = String(event.timezone ?? 'America/New_York')
      const { data: loc } = await admin
        .from('dancecard_locations')
        .select('name, short_name')
        .eq('id', body.locationId)
        .maybeSingle()
      const locLabel = String(loc?.short_name ?? loc?.name ?? 'play space')
      const when = `${formatInTimeZone(new Date(startsAt), tz, 'EEE MMM d ha')} – ${formatInTimeZone(new Date(endsAt), tz, 'ha')}`
      const summary = `You were assigned coverage: ${locLabel} · ${role.replace(/_/g, ' ')} · ${when}.`
      await notifyStaffShiftAssigned(admin, eventId, accountId, summary, {
        conflictOverride: Boolean(conflicts.length && body.overrideConflicts),
      })
      notified = true
    }

    return NextResponse.json({
      shift,
      conflicts: conflicts.length ? conflicts : undefined,
      dancecardSynced,
      notified,
      accountLinked: Boolean(accountId),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
