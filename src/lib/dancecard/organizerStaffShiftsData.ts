import type { SupabaseClient } from '@supabase/supabase-js'
import { isMissingColumn } from '@/lib/dancecard/supabaseColumnFallback'

const STAFF_SHIFT_SELECT_FULL =
  'id, person_name, person_id, role, location_id, starts_at, ends_at, sort_order, shift_status, claimed_by_account_id, organizer_notes_staff_only, dropped_at'

const STAFF_SHIFT_SELECT_CORE =
  'id, person_name, person_id, role, location_id, starts_at, ends_at, sort_order'

export type StaffShiftDbRow = Record<string, unknown>

export async function fetchStaffShiftRowsForEvent(
  admin: SupabaseClient,
  eventId: string,
): Promise<StaffShiftDbRow[]> {
  const full = await admin
    .from('dancecard_staff_shifts')
    .select(STAFF_SHIFT_SELECT_FULL)
    .eq('event_id', eventId)
    .order('starts_at', { ascending: true })
    .order('sort_order', { ascending: true })

  if (full.error && isMissingColumn(full.error)) {
    const core = await admin
      .from('dancecard_staff_shifts')
      .select(STAFF_SHIFT_SELECT_CORE)
      .eq('event_id', eventId)
      .order('starts_at', { ascending: true })
      .order('sort_order', { ascending: true })
    if (core.error) throw core.error
    return (core.data ?? []) as StaffShiftDbRow[]
  }

  if (full.error) throw full.error
  return (full.data ?? []) as StaffShiftDbRow[]
}
