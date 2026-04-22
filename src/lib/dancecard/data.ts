import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReservationRow, SelectionRow } from './busy'

export async function loadPrefs(admin: SupabaseClient, accountId: string): Promise<number> {
  const { data } = await admin
    .from('dancecard_prefs')
    .select('buffer_minutes')
    .eq('account_id', accountId)
    .maybeSingle()
  return data?.buffer_minutes ?? 0
}

export async function loadSelections(admin: SupabaseClient, accountId: string): Promise<
  {
    id: string
    kind: string
    slot_id: string | null
    starts_at: string
    ends_at: string
  }[]
> {
  const { data, error } = await admin
    .from('dancecard_selections')
    .select('id, kind, slot_id, starts_at, ends_at')
    .eq('account_id', accountId)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function loadReservationsForAccount(
  admin: SupabaseClient,
  eventId: string,
  accountId: string
): Promise<ReservationRow[]> {
  const { data, error } = await admin
    .from('dancecard_reservations')
    .select('host_account_id, guest_account_id, starts_at, ends_at, status')
    .eq('event_id', eventId)
    .or(`host_account_id.eq.${accountId},guest_account_id.eq.${accountId}`)
  if (error) throw error
  return (data ?? []) as ReservationRow[]
}

export function selectionsToBusyInput(
  rows: { starts_at: string; ends_at: string }[]
): SelectionRow[] {
  return rows.map((r) => ({ starts_at: r.starts_at, ends_at: r.ends_at }))
}
