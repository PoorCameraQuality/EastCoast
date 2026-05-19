'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatInTimeZone } from 'date-fns-tz'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { formatTimeLabel } from '@/components/dancecard/organizer/organizerTimeline'
import type { OrganizerLocationDto } from '@/lib/dancecard/organizerLocationDto'
import type { OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'
import { isDmStaffRole } from '@/lib/dancecard/dmCoverageScanner'
import { DatetimeLocalField, useConfirmDialog } from '@/components/dancecard/organizer/ui'

export type StaffShiftRow = OrganizerStaffShiftDto

const SHIFT_STATUSES = ['draft', 'open', 'assigned', 'dropped'] as const

const SHIFT_STATUS_LABELS: Record<(typeof SHIFT_STATUSES)[number], string> = {
  draft: 'Draft',
  open: 'Open (needs someone)',
  assigned: 'Assigned',
  dropped: 'Dropped',
}

type ShiftListFilter = 'all' | 'open' | 'unstaffed' | 'needs_vetting'

function shiftMatchesFilter(s: OrganizerStaffShiftDto, filter: ShiftListFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'open') return s.shiftStatus === 'open'
  if (filter === 'unstaffed') {
    return s.shiftStatus === 'open' || !s.personName.trim() || s.shiftStatus === 'draft'
  }
  if (filter === 'needs_vetting') return isDmStaffRole(s.role)
  return true
}

export function StaffShiftsPanel({
  eventSlug,
  timezone,
  shifts,
  onRefresh,
  readOnly = false,
}: {
  eventSlug: string
  timezone: string
  shifts: OrganizerStaffShiftDto[]
  onRefresh: () => Promise<void>
  readOnly?: boolean
}) {
  const [locations, setLocations] = useState<OrganizerLocationDto[]>([])
  const [personName, setPersonName] = useState('')
  const [role, setRole] = useState('volunteer')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [locationId, setLocationId] = useState('')
  const [shiftStatus, setShiftStatus] = useState<(typeof SHIFT_STATUSES)[number]>('assigned')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [listFilter, setListFilter] = useState<ShiftListFilter>('all')
  const { ask, dialog } = useConfirmDialog()

  const loadLocations = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<{ locations: OrganizerLocationDto[] }>(eventSlug, '/locations')
      setLocations(res.locations ?? [])
    } catch {
      setLocations([])
    }
  }, [eventSlug])

  useEffect(() => {
    void loadLocations()
  }, [loadLocations])

  const locationById = useMemo(() => new Map(locations.map((l) => [l.id, l.name])), [locations])

  const sorted = useMemo(
    () => [...shifts].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [shifts],
  )

  const filtered = useMemo(
    () => sorted.filter((s) => shiftMatchesFilter(s, listFilter)),
    [sorted, listFilter],
  )

  const shiftsByDay = useMemo(() => {
    const map = new Map<string, OrganizerStaffShiftDto[]>()
    for (const s of filtered) {
      const day = formatInTimeZone(new Date(s.startsAt), timezone, 'yyyy-MM-dd')
      const list = map.get(day) ?? []
      list.push(s)
      map.set(day, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered, timezone])

  async function patchShift(id: string, patch: Record<string, unknown>) {
    if (readOnly) return
    setErr(null)
    try {
      await organizerDancecardFetch(eventSlug, `/staff-shifts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      await onRefresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function addShift() {
    if (readOnly) return
    setErr(null)
    if (!personName.trim() || !role.trim() || !startsAt || !endsAt) {
      setErr('Fill person, role, start, and end')
      return
    }
    const dm = isDmStaffRole(role)
    if (dm && !locationId) {
      setErr('Coverage role shifts require a play-space location')
      return
    }
    setBusy(true)
    try {
      await organizerDancecardFetch(eventSlug, '/staff-shifts', {
        method: 'POST',
        body: JSON.stringify({
          personName: personName.trim(),
          role: role.trim(),
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          locationId: locationId || null,
          shiftStatus,
        }),
      })
      setPersonName('')
      setRole('volunteer')
      setStartsAt('')
      setEndsAt('')
      setLocationId('')
      setShiftStatus('assigned')
      await onRefresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (readOnly) return
    if (!(await ask({ title: 'Delete shift?', message: 'Delete this staff shift?', destructive: true }))) return
    try {
      await organizerDancecardFetch(eventSlug, `/staff-shifts/${id}`, { method: 'DELETE' })
      await onRefresh()
    } catch {
      setErr('Delete failed')
    }
  }

  const hoursByPerson = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of shifts) {
      const name = s.personName.trim()
      if (!name || s.shiftStatus === 'dropped') continue
      const mins = (new Date(s.endsAt).getTime() - new Date(s.startsAt).getTime()) / 60_000
      if (!Number.isFinite(mins) || mins <= 0) continue
      map.set(name, (map.get(name) ?? 0) + mins)
    }
    return map
  }, [shifts])

  const DEMO_EXPECTED_HOURS: Record<string, number> = {
    'Casey Host': 8,
    'Drew Volunteer': 16,
    'Emery DM': 12,
    'Finley Safety': 10,
  }

  const hoursSummary = useMemo(() => {
    const names = Array.from(hoursByPerson.keys()).sort()
    return names.map((name) => {
      const scheduled = (hoursByPerson.get(name) ?? 0) / 60
      const expected = DEMO_EXPECTED_HOURS[name] ?? 8
      return { name, scheduled, expected }
    })
  }, [hoursByPerson])

  const listFilters: { key: ShiftListFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'unstaffed', label: 'Unstaffed' },
    { key: 'needs_vetting', label: 'Needs vetting' },
  ]

  return (
    <div className="space-y-4">
      {dialog}
      <div className="rounded-xl border border-dc-border bg-dc-elevated-muted px-4 py-3">
        <p className="text-sm leading-relaxed text-dc-muted">
          Create shifts, see who is scheduled, and filter for open or unstaffed blocks. Assign a person name on each row;
          use Open status for shifts volunteers can claim.
        </p>
      </div>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      {hoursSummary.length > 0 ? (
        <div className="rounded-xl border border-dc-border bg-dc-elevated-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Hours on the board</p>
          <p className="mt-1 text-xs text-dc-muted">
            Scheduled hours from shifts below. Expected hours are demo targets until comp codes are wired in.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {hoursSummary.map(({ name, scheduled, expected }) => {
              const over = scheduled > expected + 0.25
              const under = scheduled < expected - 0.25
              return (
                <li
                  key={name}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    over
                      ? 'border-amber-400/30 bg-amber-100 text-amber-900'
                      : under
                        ? 'border-slate-500/30 bg-dc-surface-muted text-dc-muted'
                        : 'border-emerald-400/25 bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-dc-muted">
                    {' '}
                    · {scheduled.toFixed(1)}h scheduled / {expected}h expected
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {listFilters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={
              listFilter === key
                ? 'rounded-full border border-violet-400/40 bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800'
                : 'rounded-full border border-dc-border px-3 py-1.5 text-xs text-dc-muted hover:bg-dc-elevated-muted'
            }
            onClick={() => setListFilter(key)}
          >
            {label}
            {key === 'all' ? ` (${sorted.length})` : ` (${sorted.filter((s) => shiftMatchesFilter(s, key)).length})`}
          </button>
        ))}
      </div>
      <div className={`rounded-xl border border-dc-border bg-dc-surface-muted p-4 ${readOnly ? 'opacity-60' : ''}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Add shift</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs text-dc-muted">
            Person name
            <input
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
              value={personName}
              disabled={readOnly}
              onChange={(e) => setPersonName(e.target.value)}
            />
          </label>
          <label className="text-xs text-dc-muted">
            Role
            <input
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
              value={role}
              disabled={readOnly}
              onChange={(e) => setRole(e.target.value)}
              placeholder="volunteer, dm_lead, door..."
            />
          </label>
          <label className="text-xs text-dc-muted">
            Play-space (required for coverage roles)
            <select
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
              value={locationId}
              disabled={readOnly}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">— none —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-dc-muted">
            Shift status
            <select
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
              value={shiftStatus}
              disabled={readOnly}
              onChange={(e) => setShiftStatus(e.target.value as (typeof SHIFT_STATUSES)[number])}
            >
              {SHIFT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SHIFT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <DatetimeLocalField
            label="Starts (local)"
            value={startsAt}
            disabled={readOnly}
            onChange={setStartsAt}
          />
          <DatetimeLocalField label="Ends" value={endsAt} disabled={readOnly} onChange={setEndsAt} />
        </div>
        <button
          type="button"
          disabled={busy || readOnly}
          className="mt-3 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-dc-text hover:bg-violet-500 disabled:opacity-50"
          onClick={() => void addShift()}
        >
          {busy ? 'Saving…' : 'Add shift'}
        </button>
      </div>

      <div className="space-y-3 lg:hidden">
        <p className="text-xs font-semibold uppercase text-dc-muted">Timeline (mobile)</p>
        {shiftsByDay.map(([day, dayShifts]) => (
          <div key={day} className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3">
            <p className="text-sm font-semibold text-dc-text">{day}</p>
            <ul className="mt-2 space-y-2 text-xs">
              {dayShifts.map((s) => (
                <li key={s.id} className="rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-2">
                  <p className="font-semibold text-dc-text">{s.personName.trim() || 'Unassigned'}</p>
                  <p className="text-dc-muted">
                    {formatTimeLabel(s.startsAt, timezone)} – {formatTimeLabel(s.endsAt, timezone)} · {s.role}
                  </p>
                  <p className="text-dc-muted">
                    {s.locationId ? locationById.get(s.locationId) ?? s.locationId : '—'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!shiftsByDay.length ? (
          <p className="text-sm text-dc-muted">
            {sorted.length ? 'No shifts match this filter.' : 'No shifts yet.'}
          </p>
        ) : null}
      </div>

      <div className="hidden rounded-xl border border-dc-border bg-dc-elevated-muted lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-dc-border text-xs uppercase text-dc-muted">
            <tr>
              <th className="px-2 py-2">Person</th>
              <th className="px-2 py-2">When</th>
              <th className="px-2 py-2">Role</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Location</th>
              <th className="px-2 py-2">Staff notes</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-dc-border/50 hover:bg-white/[0.03]">
                <td className="px-2 py-2 align-top">
                  <span className="font-semibold text-dc-text">{s.personName.trim() || 'Unassigned'}</span>
                </td>
                <td className="px-2 py-2 align-top text-dc-muted">
                  {formatTimeLabel(s.startsAt, timezone)} – {formatTimeLabel(s.endsAt, timezone)}
                </td>
                <td className="px-2 py-2 align-top text-dc-muted">{s.role}</td>
                <td className="px-2 py-2 align-top">
                  {readOnly ? (
                    <span className="text-dc-muted">
                      {SHIFT_STATUS_LABELS[s.shiftStatus as (typeof SHIFT_STATUSES)[number]] ?? s.shiftStatus}
                    </span>
                  ) : (
                    <select
                      className="max-w-[9rem] rounded border border-dc-border bg-dc-surface-muted px-1 py-1 text-xs text-dc-text"
                      value={s.shiftStatus}
                      onChange={(e) =>
                        void patchShift(s.id, { shiftStatus: e.target.value as (typeof SHIFT_STATUSES)[number] })
                      }
                    >
                      {SHIFT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {SHIFT_STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-2 py-2 align-top">
                  {readOnly ? (
                    <span className="text-xs text-dc-muted">
                      {s.locationId ? locationById.get(s.locationId) ?? s.locationId : '—'}
                    </span>
                  ) : (
                    <select
                      className="max-w-[8rem] rounded border border-dc-border bg-dc-surface-muted px-1 py-1 text-xs text-dc-text"
                      value={s.locationId ?? ''}
                      onChange={(e) => void patchShift(s.id, { locationId: e.target.value || null })}
                    >
                      <option value="">—</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-2 py-2 align-top">
                  {readOnly ? (
                    <span className="line-clamp-2 text-xs text-dc-muted">{s.organizerNotesStaffOnly ?? '—'}</span>
                  ) : (
                    <textarea
                      className="w-full min-w-[8rem] rounded border border-dc-border bg-dc-surface-muted px-2 py-1 text-xs text-dc-text"
                      rows={2}
                      defaultValue={s.organizerNotesStaffOnly ?? ''}
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (s.organizerNotesStaffOnly ?? null)) {
                          void patchShift(s.id, { organizerNotesStaffOnly: v })
                        }
                      }}
                    />
                  )}
                </td>
                <td className="px-2 py-2 align-top text-right">
                  {readOnly ? null : (
                    <div className="flex flex-col items-end gap-1">
                      {s.claimedByAccountId ? (
                        <button
                          type="button"
                          className="text-[10px] text-amber-300 hover:underline"
                          onClick={() => void patchShift(s.id, { clearClaimedBy: true })}
                        >
                          Clear claim
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="text-xs text-red-700 hover:text-red-700"
                        onClick={() => void remove(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-dc-muted">
            {sorted.length ? 'No shifts match this filter.' : 'No staff shifts yet.'}
          </p>
        ) : null}
      </div>
    </div>
  )
}
