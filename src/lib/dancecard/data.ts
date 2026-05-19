import type { SupabaseClient } from '@supabase/supabase-js'
import { parseProfileStored, type AttendeeProfileStored } from '@/lib/dancecard/attendeeProfile'
import type { CompareVisibility } from '@/lib/dancecard/comparePrivacy'
import type { ReservationRow, SelectionRow } from './busy'

export type DancecardPrefsLoaded = {
  bufferMinutes: number
  allowCompareByUsername: boolean
  compareVisibility: CompareVisibility
  showInCompareDirectory: boolean
  hideBusyDetailsInCompare: boolean
  icsRemindBeforeMinutes: number
  profile: AttendeeProfileStored
}

function parseCompareVisibility(raw: unknown, allowCompareLegacy: boolean): CompareVisibility {
  if (raw === 'username' || raw === 'link_only' || raw === 'off') return raw
  return allowCompareLegacy ? 'username' : 'off'
}

export async function loadPrefs(admin: SupabaseClient, accountId: string): Promise<DancecardPrefsLoaded> {
  const { data, error } = await admin
    .from('dancecard_prefs')
    .select(
      'buffer_minutes, allow_compare_by_username, profile_json, compare_visibility, show_in_compare_directory, hide_busy_details_in_compare, ics_remind_before_minutes'
    )
    .eq('account_id', accountId)
    .maybeSingle()
  if (error) {
    const code = (error as { code?: string }).code
    if (code === '42703') {
      const { data: d2, error: e2 } = await admin
        .from('dancecard_prefs')
        .select('buffer_minutes, allow_compare_by_username, profile_json')
        .eq('account_id', accountId)
        .maybeSingle()
      if (e2) throw e2
      const allow = Boolean(d2?.allow_compare_by_username)
      return {
        bufferMinutes: d2?.buffer_minutes ?? 0,
        allowCompareByUsername: allow,
        compareVisibility: allow ? 'username' : 'off',
        showInCompareDirectory: false,
        hideBusyDetailsInCompare: false,
        icsRemindBeforeMinutes: 15,
        profile: parseProfileStored(d2?.profile_json),
      }
    }
    throw error
  }
  const row = data as {
    buffer_minutes?: number
    allow_compare_by_username?: boolean
    profile_json?: unknown
    compare_visibility?: string
    show_in_compare_directory?: boolean
    hide_busy_details_in_compare?: boolean
    ics_remind_before_minutes?: number
  }
  const allowLegacy = Boolean(row?.allow_compare_by_username)
  const visibility = parseCompareVisibility(row?.compare_visibility, allowLegacy)
  return {
    bufferMinutes: row?.buffer_minutes ?? 0,
    allowCompareByUsername: visibility === 'username',
    compareVisibility: visibility,
    showInCompareDirectory: Boolean(row?.show_in_compare_directory),
    hideBusyDetailsInCompare: Boolean(row?.hide_busy_details_in_compare),
    icsRemindBeforeMinutes:
      typeof row?.ics_remind_before_minutes === 'number' ? row.ics_remind_before_minutes : 15,
    profile: parseProfileStored(row?.profile_json),
  }
}

export async function saveAccountProfile(
  admin: SupabaseClient,
  accountId: string,
  profile: AttendeeProfileStored
): Promise<{ ok: true } | { ok: false; reason: 'profile_column_missing' }> {
  const updatedAt = new Date().toISOString()
  const { data: updated, error: upErr } = await admin
    .from('dancecard_prefs')
    .update({ profile_json: profile, updated_at: updatedAt })
    .eq('account_id', accountId)
    .select('account_id')
    .maybeSingle()

  if (upErr) {
    const code = (upErr as { code?: string }).code
    if (code === '42703') return { ok: false, reason: 'profile_column_missing' }
    throw upErr
  }
  if (updated) return { ok: true }

  const { error: insErr } = await admin.from('dancecard_prefs').insert({
    account_id: accountId,
    buffer_minutes: 0,
    profile_json: profile,
    updated_at: updatedAt,
  })
  if (insErr) {
    const code = (insErr as { code?: string }).code
    if (code === '42703') return { ok: false, reason: 'profile_column_missing' }
    throw insErr
  }
  return { ok: true }
}

export type SetPrefsAllowCompareResult =
  | { ok: true }
  | { ok: false; reason: 'allow_compare_column_missing' }

/**
 * Persists compare-by-username opt-in. Creates a prefs row if the account has none yet.
 * If `allow_compare_by_username` is not in the database (migration not applied), returns
 * `allow_compare_column_missing` instead of throwing.
 */
export async function setPrefsAllowCompareByUsername(
  admin: SupabaseClient,
  accountId: string,
  allowCompareByUsername: boolean
): Promise<SetPrefsAllowCompareResult> {
  return setPrefsCompareVisibility(admin, accountId, allowCompareByUsername ? 'username' : 'off')
}

export type SetPrefsPatchResult = { ok: true } | { ok: false; reason: 'column_missing' }

async function upsertPrefsPatch(
  admin: SupabaseClient,
  accountId: string,
  payload: Record<string, unknown>
): Promise<SetPrefsPatchResult> {
  const updatedAt = new Date().toISOString()
  const full = { ...payload, updated_at: updatedAt }
  const { data: updated, error: upErr } = await admin
    .from('dancecard_prefs')
    .update(full)
    .eq('account_id', accountId)
    .select('account_id')
    .maybeSingle()
  if (upErr) {
    const code = (upErr as { code?: string }).code
    if (code === '42703') return { ok: false, reason: 'column_missing' }
    throw upErr
  }
  if (updated) return { ok: true }
  const { error: insErr } = await admin.from('dancecard_prefs').insert({
    account_id: accountId,
    buffer_minutes: 0,
    ...full,
  })
  if (insErr) {
    const code = (insErr as { code?: string }).code
    if (code === '42703') return { ok: false, reason: 'column_missing' }
    throw insErr
  }
  return { ok: true }
}

export async function setPrefsCompareVisibility(
  admin: SupabaseClient,
  accountId: string,
  compareVisibility: CompareVisibility
): Promise<SetPrefsAllowCompareResult> {
  const res = await upsertPrefsPatch(admin, accountId, {
    compare_visibility: compareVisibility,
    allow_compare_by_username: compareVisibility === 'username',
  })
  if (!res.ok) return { ok: false, reason: 'allow_compare_column_missing' }
  return { ok: true }
}

export async function setPrefsIcsRemindBeforeMinutes(
  admin: SupabaseClient,
  accountId: string,
  minutes: number
): Promise<SetPrefsPatchResult> {
  const m = Math.max(0, Math.min(24 * 60, Math.floor(minutes)))
  return upsertPrefsPatch(admin, accountId, { ics_remind_before_minutes: m })
}

export async function setPrefsComparePrivacy(
  admin: SupabaseClient,
  accountId: string,
  patch: {
    compareVisibility?: CompareVisibility
    showInCompareDirectory?: boolean
    hideBusyDetailsInCompare?: boolean
  }
): Promise<SetPrefsPatchResult> {
  const payload: Record<string, unknown> = {}
  if (patch.compareVisibility !== undefined) {
    payload.compare_visibility = patch.compareVisibility
    payload.allow_compare_by_username = patch.compareVisibility === 'username'
  }
  if (patch.showInCompareDirectory !== undefined) {
    payload.show_in_compare_directory = patch.showInCompareDirectory
  }
  if (patch.hideBusyDetailsInCompare !== undefined) {
    payload.hide_busy_details_in_compare = patch.hideBusyDetailsInCompare
  }
  return upsertPrefsPatch(admin, accountId, payload)
}

export async function loadAvailabilityRange(
  admin: SupabaseClient,
  accountId: string
): Promise<{ startsAt: string; endsAt: string } | null> {
  const { data, error } = await admin
    .from('dancecard_prefs')
    .select('availability_starts_at, availability_ends_at')
    .eq('account_id', accountId)
    .maybeSingle()
  if (error) {
    // Backward compatibility while DB migration is being rolled out.
    const code = (error as { code?: string }).code
    if (code === '42703') return null
    throw error
  }
  if (!data?.availability_starts_at || !data?.availability_ends_at) return null
  return {
    startsAt: data.availability_starts_at as string,
    endsAt: data.availability_ends_at as string,
  }
}

export type LoadedSelectionRow = {
  id: string
  kind: string
  slot_id: string | null
  starts_at: string
  ends_at: string
  note: string | null
  /** Joined from dancecard_program_slots when kind is program */
  program_title: string | null
  program_room: string | null
  program_track: string | null
}

export async function loadSelections(admin: SupabaseClient, accountId: string): Promise<LoadedSelectionRow[]> {
  const { data, error } = await admin
    .from('dancecard_selections')
    .select(
      `
      id,
      kind,
      slot_id,
      starts_at,
      ends_at,
      note,
      dancecard_program_slots ( title, room, track )
    `,
    )
    .eq('account_id', accountId)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row: Record<string, unknown>) => {
    const slot = row.dancecard_program_slots as {
      title: string
      room: string | null
      track: string | null
    } | null | undefined
    return {
      id: row.id as string,
      kind: row.kind as string,
      slot_id: (row.slot_id as string | null) ?? null,
      starts_at: row.starts_at as string,
      ends_at: row.ends_at as string,
      note: (row.note as string | null) ?? null,
      program_title: slot?.title ?? null,
      program_room: slot?.room ?? null,
      program_track: slot?.track ?? null,
    }
  })
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
