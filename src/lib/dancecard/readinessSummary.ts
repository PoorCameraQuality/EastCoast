import { fetchProgramSlotRowsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'
import { fetchStaffShiftRowsForEvent } from '@/lib/dancecard/organizerStaffShiftsData'
import { READINESS_ACTION } from '@/lib/dancecard/readinessHumanCopy'
import type { ReadinessCheck } from '@/lib/dancecard/readinessTypes'
import { isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ReadinessSummaryMeta = {
  slotCount: number
  unpublishedCount: number
  locationCount: number
  staffShiftCount: number
  registrationCategoryCount: number
}

export type ReadinessSummaryData = {
  slotRows: Awaited<ReturnType<typeof fetchProgramSlotRowsForEvent>>
  staffRows: Awaited<ReturnType<typeof fetchStaffShiftRowsForEvent>>
  staffLoadFailed: boolean
  locationNames: Record<string, string>
}

type EventRow = {
  id: string
  status?: string | null
}

/**
 * Fast readiness checks for dashboard initial load — no registrant scans,
 * policy acceptance loops, conflict scanner, or presenter coverage queries.
 */
export async function buildReadinessSummaryChecks(
  admin: SupabaseClient,
  event: EventRow,
): Promise<{ checks: ReadinessCheck[]; meta: ReadinessSummaryMeta; data: ReadinessSummaryData }> {
  const eventId = event.id
  const checks: ReadinessCheck[] = []
  const locationNames: Record<string, string> = {}

  const [locListResult, slotRows, staffResult, catResult, regFormResult] = await Promise.all([
    admin.from('dancecard_locations').select('id, name').eq('event_id', eventId),
    fetchProgramSlotRowsForEvent(admin, eventId),
    fetchStaffShiftRowsForEvent(admin, eventId).then(
      (rows) => ({ rows, failed: false as const }),
      () => ({ rows: [] as Awaited<ReturnType<typeof fetchStaffShiftRowsForEvent>>, failed: true as const }),
    ),
    admin
      .from('dancecard_registration_categories')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId),
    admin.from('dancecard_registration_forms').select('status').eq('event_id', eventId).maybeSingle(),
  ])

  const { data: locRows, error: locListErr } = locListResult
  if (locListErr && !isMissingTable(locListErr, 'dancecard_locations')) throw locListErr
  for (const l of locRows ?? []) {
    locationNames[l.id as string] = String(l.name ?? '').trim() || 'Unnamed room'
  }
  const nLoc = Object.keys(locationNames).length

  if (event.status !== 'published') {
    checks.push({
      id: 'event-unpublished',
      severity: 'warning',
      title: 'This event is not live on the public dancecard yet',
      detail: 'Publish the event when you are ready for attendees to find it by name.',
      action: READINESS_ACTION.settings,
    })
  } else {
    checks.push({
      id: 'event-published',
      severity: 'ok',
      title: 'Event is live on the public dancecard',
    })
  }

  const unpublishedCount = slotRows.filter((s) => !(s as { is_published?: boolean }).is_published).length

  if (slotRows.length === 0) {
    checks.push({
      id: 'program-empty',
      severity: 'warning',
      title: 'No classes on the schedule yet',
      detail: 'Import a spreadsheet or add classes on the program grid.',
      action: READINESS_ACTION.program,
    })
  } else {
    checks.push({
      id: 'program-count',
      severity: 'ok',
      title: `${slotRows.length} class${slotRows.length === 1 ? '' : 'es'} on the schedule`,
    })
    if (unpublishedCount > 0) {
      checks.push({
        id: 'slots-unpublished',
        severity: 'info',
        title: `${unpublishedCount} class${unpublishedCount === 1 ? ' is' : 'es are'} hidden from the public schedule`,
        detail: 'Only published classes appear on the attendee-facing dancecard.',
        action: READINESS_ACTION.program,
      })
    }
  }

  if (nLoc === 0) {
    checks.push({
      id: 'locations-none',
      severity: 'info',
      title: 'Rooms are entered as free text only',
      detail: 'Add named rooms under Event settings if you want a consistent room list for imports and maps.',
      action: READINESS_ACTION.settings,
    })
  } else {
    checks.push({
      id: 'locations-ok',
      severity: 'ok',
      title: `${nLoc} room${nLoc === 1 ? '' : 's'} in your venue list`,
    })
  }

  const { rows: staffRows, failed: staffLoadFailed } = staffResult
  if (staffLoadFailed) {
    checks.push({
      id: 'staff-load-failed',
      severity: 'info',
      title: 'Staff shift list could not be checked',
      detail: 'If you use volunteer shifts, open Staff shifts to confirm they loaded. A database migration may be pending.',
      action: READINESS_ACTION.peopleStaff,
    })
  } else if (staffRows.length === 0) {
    checks.push({
      id: 'staff-empty',
      severity: 'info',
      title: 'No volunteer or staff shifts yet',
      detail: 'Add shifts when you want to track who is on duty.',
      action: READINESS_ACTION.peopleStaff,
    })
  } else {
    const nSh = staffRows.length
    checks.push({
      id: 'staff-count',
      severity: 'ok',
      title: `${nSh} staff or volunteer shift${nSh === 1 ? '' : 's'} on the board`,
    })
  }

  const { count: catCount, error: catErr } = catResult
  if (catErr) throw catErr
  const nCat = typeof catCount === 'number' ? catCount : 0
  if (nCat === 0) {
    checks.push({
      id: 'reg-categories-empty',
      severity: 'info',
      title: 'No registration types set up yet',
      detail: 'Examples: Full weekend, day pass, staff. Add at least one before using the registrant list.',
      action: READINESS_ACTION.settings,
    })
  } else {
    checks.push({
      id: 'reg-categories-ok',
      severity: 'ok',
      title: `${nCat} registration type${nCat === 1 ? '' : 's'} configured`,
    })
  }

  const { data: regForm, error: rfErr } = regFormResult
  if (rfErr) throw rfErr
  if (!regForm) {
    checks.push({
      id: 'reg-form-missing',
      severity: 'info',
      title: 'No registration form yet',
      detail: 'Create one under Event settings when you are ready to collect sign-ups.',
      action: READINESS_ACTION.settings,
    })
  } else if ((regForm.status as string) !== 'published') {
    checks.push({
      id: 'reg-form-draft',
      severity: 'info',
      title: 'Registration form is still a draft',
      detail: 'Publish it when organizers should treat registration as open.',
      action: READINESS_ACTION.settings,
    })
  } else {
    checks.push({ id: 'reg-form-published', severity: 'ok', title: 'Registration form is published' })
  }

  return {
    checks,
    meta: {
      slotCount: slotRows.length,
      unpublishedCount,
      locationCount: nLoc,
      staffShiftCount: staffRows.length,
      registrationCategoryCount: nCat,
    },
    data: {
      slotRows,
      staffRows,
      staffLoadFailed,
      locationNames,
    },
  }
}
