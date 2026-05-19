import type { SupabaseClient } from '@supabase/supabase-js'
import type { DancecardConflict } from '@/lib/dancecard/conflictScanner'
import { scanDancecardConflictsForEvent } from '@/lib/dancecard/conflictScanFromEvent'
import { DANCECARD_ACCOUNT_REGISTRANT_SOURCE } from '@/lib/dancecard/ensureSelfServiceRegistrant'

export type SlotScheduleSnapshot = {
  title: string
  startsAt: string | null
  endsAt: string | null
  room: string | null
  locationId: string | null
  locationName: string | null
}

export type ScheduleChangeHolder = {
  accountId: string
  displayName: string
}

export type ScheduleChangePresenter = {
  personId: string
  sceneName: string
  role: string
  accountId: string | null
}

export type ScheduleChangeImpactReport = {
  scheduleChanged: boolean
  summaryText: string
  slotTitle: string
  before: SlotScheduleSnapshot
  after: SlotScheduleSnapshot
  dancecardHolders: ScheduleChangeHolder[]
  presenters: ScheduleChangePresenter[]
  programConflicts: DancecardConflict[]
}

export function slotSnapshotFromParts(parts: {
  title: string
  starts_at?: string | null
  ends_at?: string | null
  room?: string | null
  location_id?: string | null
  locationName?: string | null
}): SlotScheduleSnapshot {
  return {
    title: String(parts.title ?? ''),
    startsAt: parts.starts_at != null ? String(parts.starts_at) : null,
    endsAt: parts.ends_at != null ? String(parts.ends_at) : null,
    room: (parts.room as string | null) ?? null,
    locationId: (parts.location_id as string | null) ?? null,
    locationName: parts.locationName ?? null,
  }
}

function roomLabel(s: SlotScheduleSnapshot): string {
  return (s.locationName ?? s.room ?? '').trim() || 'TBD'
}

function timeLabel(iso: string | null, tz: string): string {
  if (!iso) return 'unscheduled'
  try {
    return new Date(iso).toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function scheduleFieldsChanged(before: SlotScheduleSnapshot, after: SlotScheduleSnapshot): boolean {
  const norm = (v: string | null) => (v ?? '').trim()
  if (norm(before.startsAt) !== norm(after.startsAt)) return true
  if (norm(before.endsAt) !== norm(after.endsAt)) return true
  if (norm(before.room) !== norm(after.room)) return true
  if (norm(before.locationId) !== norm(after.locationId)) return true
  return false
}

export function formatScheduleChangeSummary(
  before: SlotScheduleSnapshot,
  after: SlotScheduleSnapshot,
  timezone: string,
): string {
  const title = after.title || before.title || 'Session'
  const parts: string[] = [title]
  const timeBefore = timeLabel(before.startsAt, timezone)
  const timeAfter = timeLabel(after.startsAt, timezone)
  if (timeBefore !== timeAfter) {
    parts.push(`${timeAfter} (was ${timeBefore})`)
  }
  const roomBefore = roomLabel(before)
  const roomAfter = roomLabel(after)
  if (roomBefore !== roomAfter) {
    parts.push(`${roomAfter} (was ${roomBefore})`)
  }
  return parts.join(': ')
}

export function formatScheduleChangeMessage(
  report: Pick<ScheduleChangeImpactReport, 'slotTitle' | 'before' | 'after' | 'summaryText'>,
  timezone: string,
): string {
  const summary =
    report.summaryText ||
    formatScheduleChangeSummary(report.before, report.after, timezone)
  return (
    `${report.slotTitle || 'A session'} was rescheduled — ${summary}. ` +
    'Open Program to see the official time. My dancecard may still show the old time until you review it.'
  )
}

async function loadLocationNames(
  admin: SupabaseClient,
  eventId: string,
  locationIds: string[],
): Promise<Record<string, string>> {
  const ids = Array.from(new Set(locationIds.filter(Boolean)))
  if (!ids.length) return {}
  const { data, error } = await admin
    .from('dancecard_locations')
    .select('id, name')
    .eq('event_id', eventId)
    .in('id', ids)
  if (error) throw error
  const out: Record<string, string> = {}
  for (const row of data ?? []) {
    out[row.id as string] = String(row.name ?? '')
  }
  return out
}

async function resolveAccountIdsForPeople(
  admin: SupabaseClient,
  eventId: string,
  people: { personId: string; sceneName: string }[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  if (!people.length) return out

  const personIds = people.map((p) => p.personId)
  const { data: registrants, error: regErr } = await admin
    .from('dancecard_registrants')
    .select('person_id, external_id')
    .eq('event_id', eventId)
    .in('person_id', personIds)
    .eq('external_source', DANCECARD_ACCOUNT_REGISTRANT_SOURCE)
  if (regErr) throw regErr
  for (const r of registrants ?? []) {
    const pid = r.person_id as string
    const accId = r.external_id as string
    if (pid && accId) out.set(pid, accId)
  }

  const unresolved = people.filter((p) => !out.has(p.personId))
  if (!unresolved.length) return out

  const { data: accounts, error: accErr } = await admin
    .from('dancecard_accounts')
    .select('id, display_name')
    .eq('event_id', eventId)
  if (accErr) throw accErr

  for (const p of unresolved) {
    const lower = p.sceneName.trim().toLowerCase()
    if (!lower) continue
    const match = (accounts ?? []).find(
      (a) => String(a.display_name ?? '').trim().toLowerCase() === lower,
    )
    if (match) out.set(p.personId, String(match.id))
  }

  return out
}

export async function computeScheduleChangeImpact(
  admin: SupabaseClient,
  eventId: string,
  slotId: string,
  before: SlotScheduleSnapshot,
  after: SlotScheduleSnapshot,
  timezone: string,
): Promise<ScheduleChangeImpactReport> {
  const scheduleChanged = scheduleFieldsChanged(before, after)
  const slotTitle = after.title || before.title
  const summaryText = formatScheduleChangeSummary(before, after, timezone)

  const dancecardHolders: ScheduleChangeHolder[] = []
  const presenters: ScheduleChangePresenter[] = []
  let programConflicts: DancecardConflict[] = []

  if (scheduleChanged) {
    const { data: selections, error: selErr } = await admin
      .from('dancecard_selections')
      .select('account_id, dancecard_accounts(display_name)')
      .eq('slot_id', slotId)
      .eq('kind', 'program')
    if (selErr) throw selErr

    const accountIds = new Set<string>()
    for (const row of selections ?? []) {
      const accountId = row.account_id as string
      if (!accountId || accountIds.has(accountId)) continue
      accountIds.add(accountId)
      const acc = row.dancecard_accounts as { display_name?: string } | { display_name?: string }[] | null
      const accRow = Array.isArray(acc) ? acc[0] : acc
      dancecardHolders.push({
        accountId,
        displayName: String(accRow?.display_name ?? 'Attendee'),
      })
    }

    const { data: slotPeople, error: spErr } = await admin
      .from('dancecard_program_slot_persons')
      .select('person_id, role, dancecard_persons(scene_name)')
      .eq('slot_id', slotId)
    if (spErr) throw spErr

    const people: { personId: string; sceneName: string; role: string }[] = []
    for (const row of slotPeople ?? []) {
      const p = row.dancecard_persons as { scene_name?: string } | { scene_name?: string }[] | null
      const person = Array.isArray(p) ? p[0] : p
      people.push({
        personId: row.person_id as string,
        sceneName: String(person?.scene_name ?? ''),
        role: String(row.role ?? ''),
      })
    }

    const accountByPerson = await resolveAccountIdsForPeople(admin, eventId, people)
    for (const p of people) {
      presenters.push({
        personId: p.personId,
        sceneName: p.sceneName,
        role: p.role,
        accountId: accountByPerson.get(p.personId) ?? null,
      })
    }

    const allConflicts = await scanDancecardConflictsForEvent(admin, eventId)
    programConflicts = allConflicts.filter((c) => c.relatedSlotIds.includes(slotId))
  }

  return {
    scheduleChanged,
    summaryText,
    slotTitle,
    before,
    after,
    dancecardHolders,
    presenters,
    programConflicts,
  }
}

/** Build before/after snapshots with location names resolved from DB. */
export async function buildSlotSnapshots(
  admin: SupabaseClient,
  eventId: string,
  beforeRow: Record<string, unknown>,
  afterRow: Record<string, unknown>,
): Promise<{ before: SlotScheduleSnapshot; after: SlotScheduleSnapshot }> {
  const locIds = [
    beforeRow.location_id as string | null,
    afterRow.location_id as string | null,
  ].filter(Boolean) as string[]
  const locNames = await loadLocationNames(admin, eventId, locIds)
  const before = slotSnapshotFromParts({
    title: String(beforeRow.title ?? ''),
    starts_at: beforeRow.starts_at as string | null,
    ends_at: beforeRow.ends_at as string | null,
    room: beforeRow.room as string | null,
    location_id: beforeRow.location_id as string | null,
    locationName: beforeRow.location_id ? locNames[beforeRow.location_id as string] ?? null : null,
  })
  const after = slotSnapshotFromParts({
    title: String(afterRow.title ?? ''),
    starts_at: afterRow.starts_at as string | null,
    ends_at: afterRow.ends_at as string | null,
    room: afterRow.room as string | null,
    location_id: afterRow.location_id as string | null,
    locationName: afterRow.location_id ? locNames[afterRow.location_id as string] ?? null : null,
  })
  return { before, after }
}

export function snapshotFromOrganizerSlot(slot: {
  title: string
  startsAt: string | null
  endsAt: string | null
  room: string | null
  locationId: string | null
  locationName: string | null
}): SlotScheduleSnapshot {
  return {
    title: slot.title,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    room: slot.room,
    locationId: slot.locationId,
    locationName: slot.locationName,
  }
}
