import type { SupabaseClient } from '@supabase/supabase-js'
import { staffShiftKey } from '@/lib/dancecard/staffSchedule'
import type { OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'
import { staffShiftPersonKey } from '@/lib/dancecard/staffShiftConflicts'

export async function resolveAccountIdForStaffPerson(
  admin: SupabaseClient,
  eventId: string,
  person: { personId: string | null; personName: string },
  existingShifts: OrganizerStaffShiftDto[],
): Promise<string | null> {
  const key = staffShiftPersonKey(person)
  for (const s of existingShifts) {
    if (staffShiftPersonKey(s) !== key) continue
    if (s.claimedByAccountId) return s.claimedByAccountId
  }

  const name = person.personName.trim()
  if (!name) return null

  const { data: accounts, error } = await admin
    .from('dancecard_accounts')
    .select('id, display_name')
    .eq('event_id', eventId)
  if (error) throw error

  const lower = name.toLowerCase()
  const match = (accounts ?? []).find((a) => String(a.display_name ?? '').trim().toLowerCase() === lower)
  return match ? String(match.id) : null
}

export async function appendStaffShiftToDancecard(
  admin: SupabaseClient,
  accountId: string,
  shift: { startsAt: string; endsAt: string },
): Promise<boolean> {
  const { data: existing, error: selErr } = await admin
    .from('dancecard_selections')
    .select('starts_at, ends_at, kind')
    .eq('account_id', accountId)
  if (selErr) throw selErr

  const key = staffShiftKey(shift.startsAt, shift.endsAt)
  const already = (existing ?? []).some(
    (r) => staffShiftKey(String(r.starts_at), String(r.ends_at)) === key,
  )
  if (already) return false

  const { error: insErr } = await admin.from('dancecard_selections').insert({
    account_id: accountId,
    slot_id: null,
    starts_at: new Date(shift.startsAt).toISOString(),
    ends_at: new Date(shift.endsAt).toISOString(),
    kind: 'manual',
    note: null,
  })
  if (insErr) throw insErr
  return true
}

export async function notifyStaffShiftAssigned(
  admin: SupabaseClient,
  eventId: string,
  accountId: string,
  summary: string,
  opts: { conflictOverride: boolean },
): Promise<void> {
  const message = opts.conflictOverride
    ? `${summary} (assigned with overlap — please review your dancecard.)`
    : summary

  const { error } = await admin.from('dancecard_schedule_change_notifications').insert({
    event_id: eventId,
    account_id: accountId,
    program_slot_id: null,
    old_snapshot: {},
    new_snapshot: { kind: 'staff_shift_assigned' },
    conflict_summary: message,
    status: 'unread',
  })
  if (error) throw error
}
