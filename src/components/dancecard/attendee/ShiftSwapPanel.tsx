'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import type { DancecardModules } from '@/lib/dancecard/eventEntitlements'

type SwapRow = {
  id: string
  from_shift_id: string
  to_shift_id: string
  status: string
  note: string | null
  created_at: string
}

type OpenShift = { id: string; role: string; startsAt: string; endsAt: string }

export function ShiftSwapPanel({
  eventSlug,
  modules,
  myShiftIds,
}: {
  eventSlug: string
  modules: DancecardModules | null
  myShiftIds: string[]
}) {
  const [swaps, setSwaps] = useState<SwapRow[]>([])
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([])
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const enabled = Boolean(modules?.shift_swaps)

  const [myShifts, setMyShifts] = useState<OpenShift[]>([])

  const load = useCallback(async () => {
    if (!enabled) return
    setErr(null)
    try {
      const [swapRes, openRes] = await Promise.all([
        dancecardFetch<{ swaps: SwapRow[] }>(eventSlug, '/shift-swaps'),
        dancecardFetch<{ shifts: OpenShift[]; myShifts?: OpenShift[] }>(eventSlug, '/staff-open-shifts').catch(
          () => ({ shifts: [], myShifts: [] }),
        ),
      ])
      setSwaps(swapRes.swaps ?? [])
      setOpenShifts(openRes.shifts ?? [])
      setMyShifts(openRes.myShifts ?? [])
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug, enabled])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromId || !toId || fromId === toId) return
    setBusy(true)
    setErr(null)
    try {
      await dancecardFetch(eventSlug, '/shift-swaps', {
        method: 'POST',
        body: JSON.stringify({ fromShiftId: fromId, toShiftId: toId, note: note.trim() || undefined }),
      })
      setNote('')
      setFromId('')
      setToId('')
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (!enabled) return null

  const fromIds = myShiftIds.length ? myShiftIds : myShifts.map((s) => s.id)
  const toOptions = [...openShifts.map((s) => s.id), ...fromIds.filter((id) => id !== fromId)]

  return (
    <section className="rounded-xl border border-dc-border bg-dc-surface-muted/60 p-4 text-sm text-dc-text">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-dc-accent">Shift swap requests</h3>
      {err ? <p className="mt-2 text-xs text-dc-danger">{err}</p> : null}
      {swaps.length ? (
        <ul className="mt-3 space-y-1 text-xs text-dc-muted">
          {swaps.map((s) => (
            <li key={s.id}>
              {s.status} · {s.from_shift_id.slice(0, 8)} → {s.to_shift_id.slice(0, 8)}
              {s.note ? ` — ${s.note}` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-dc-muted">No requests yet.</p>
      )}
      <form className="mt-4 space-y-2" onSubmit={(e) => void submit(e)}>
        <label className="block text-xs text-dc-muted">
          Your shift
          <select
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-2 text-dc-text"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
          >
            <option value="">Select…</option>
            {fromIds.map((id) => (
              <option key={id} value={id}>
                {id.slice(0, 8)}…
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-dc-muted">
          Swap with
          <select
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-2 text-dc-text"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          >
            <option value="">Select…</option>
            {toOptions.map((id) => (
              <option key={id} value={id}>
                {openShifts.find((o) => o.id === id)?.role ?? id.slice(0, 8)}…
              </option>
            ))}
          </select>
        </label>
        <input
          className="w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-xs text-dc-text placeholder:text-dc-muted"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy || !fromId || !toId}
          className="rounded-full bg-dc-accent px-4 py-2 text-xs font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
        >
          Request swap
        </button>
      </form>
    </section>
  )
}
