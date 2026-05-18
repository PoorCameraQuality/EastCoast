'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { formatTimeLabel } from '@/components/dancecard/organizer/organizerTimeline'
import type { OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'

type SwapRow = {
  id: string
  from_shift_id: string
  to_shift_id: string
  requester_account_id: string
  status: string
  note: string | null
  created_at: string
}

const SWAP_STATUS_LABELS: Record<string, string> = {
  pending: 'Waiting for your decision',
  approved: 'Approved',
  rejected: 'Declined',
}

function humanizeRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\bdm\b/gi, 'coverage')
}

export function ShiftSwapsPanel({
  eventSlug,
  timezone,
  readOnly = false,
}: {
  eventSlug: string
  timezone: string
  readOnly?: boolean
}) {
  const [swaps, setSwaps] = useState<SwapRow[]>([])
  const [shifts, setShifts] = useState<OrganizerStaffShiftDto[]>([])
  const [needsMigration, setNeedsMigration] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const shiftById = useMemo(() => new Map(shifts.map((s) => [s.id, s])), [shifts])

  const shiftLabel = useMemo(() => {
    return (id: string) => {
      const s = shiftById.get(id)
      if (!s) return `Shift ${id.slice(0, 8)}`
      const start = formatTimeLabel(s.startsAt, timezone)
      const end = formatTimeLabel(s.endsAt, timezone)
      const who = s.personName.trim() || 'Open shift'
      return `${who} · ${humanizeRole(s.role)} · ${start}–${end}`
    }
  }, [shiftById, timezone])

  const load = useCallback(async () => {
    setErr(null)
    try {
      const [swapRes, shiftRes] = await Promise.all([
        organizerDancecardFetch<{ swaps: SwapRow[]; needsMigration?: boolean }>(eventSlug, '/shift-swaps'),
        organizerDancecardFetch<{ shifts: OrganizerStaffShiftDto[] }>(eventSlug, '/staff-shifts'),
      ])
      setSwaps(swapRes.swaps ?? [])
      setNeedsMigration(Boolean(swapRes.needsMigration))
      setShifts(shiftRes.shifts ?? [])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load swap requests')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function decide(swapId: string, status: 'approved' | 'rejected') {
    if (readOnly) return
    setBusy(swapId)
    setErr(null)
    try {
      await organizerDancecardFetch(eventSlug, `/shift-swaps/${encodeURIComponent(swapId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  if (needsMigration) {
    return (
      <div className="rounded-xl border border-amber-200/25 bg-amber-950/30 px-4 py-5 text-sm text-amber-100">
        <p className="font-medium">Shift trades are not enabled yet</p>
        <p className="mt-2 text-amber-100/80">
          Ask your administrator to apply the latest Dancecard migration, then refresh this page.
        </p>
      </div>
    )
  }

  const pendingCount = swaps.filter((s) => s.status === 'pending').length

  return (
    <div className="space-y-4 text-sm text-slate-200">
      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="text-sm leading-relaxed text-slate-300">
          Review requests from volunteers who want to trade shifts. Approve only when both shifts are still valid and
          staffed appropriately.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Coming soon for attendees: staff will be able to propose swaps from their schedule view. You approve trades here.
        </p>
      </div>
      {err ? <p className="text-rose-300">{err}</p> : null}
      {pendingCount > 0 ? (
        <p className="text-xs text-amber-200/90">
          {pendingCount} request{pendingCount === 1 ? '' : 's'} waiting for a decision
        </p>
      ) : null}
      {!swaps.length ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center text-slate-400">
          <p className="font-medium text-slate-300">No trade requests yet</p>
          <p className="mt-2 text-xs text-slate-500">
            When a volunteer asks to swap with another shift, you will see the request here with both shifts listed.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {swaps.map((s) => (
            <li key={s.id} className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trade request</p>
                  <p className="mt-1 font-medium text-white">
                    Giving up: {shiftLabel(s.from_shift_id)}
                  </p>
                  <p className="mt-1 text-slate-300">Taking: {shiftLabel(s.to_shift_id)}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {SWAP_STATUS_LABELS[s.status] ?? s.status} · submitted{' '}
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                  {s.note ? (
                    <p className="mt-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-slate-400">
                      Note from volunteer: {s.note}
                    </p>
                  ) : null}
                </div>
                {s.status === 'pending' && !readOnly ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy === s.id}
                      className="rounded-full bg-emerald-600/80 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                      onClick={() => void decide(s.id, 'approved')}
                    >
                      Approve trade
                    </button>
                    <button
                      type="button"
                      disabled={busy === s.id}
                      className="rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200 hover:bg-rose-950/40 disabled:opacity-40"
                      onClick={() => void decide(s.id, 'rejected')}
                    >
                      Decline
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
