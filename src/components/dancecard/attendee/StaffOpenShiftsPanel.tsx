'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'

type OpenShift = {
  id: string
  role: string
  startsAt: string
  endsAt: string
}

export function StaffOpenShiftsPanel({
  eventSlug,
  timezone,
  isStaff,
}: {
  eventSlug: string
  timezone: string
  isStaff: boolean
}) {
  const [shifts, setShifts] = useState<OpenShift[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isStaff) return
    setErr(null)
    try {
      const res = await dancecardFetch<{ shifts: OpenShift[] }>(eventSlug, '/staff-open-shifts')
      setShifts(res.shifts ?? [])
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug, isStaff])

  useEffect(() => {
    void load()
  }, [load])

  async function claim(shiftId: string) {
    setBusy(shiftId)
    setNotice(null)
    try {
      await dancecardFetch(eventSlug, `/staff-shifts/${encodeURIComponent(shiftId)}/claim`, { method: 'POST' })
      setNotice('Shift claimed.')
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (!isStaff) return null

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))

  return (
    <section className="rounded-xl border border-violet-400/25 bg-violet-950/20 p-4 text-sm text-slate-200">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">Open volunteer shifts</h3>
      <p className="mt-1 text-xs text-slate-400">Claim an open shift to add it to your staff schedule.</p>
      {notice ? <p className="mt-2 text-xs text-emerald-300">{notice}</p> : null}
      {err ? <p className="mt-2 text-xs text-rose-300">{err}</p> : null}
      {!shifts.length ? (
        <p className="mt-3 text-xs text-slate-500">No open shifts right now.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {shifts.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2"
            >
              <span className="text-xs text-slate-200">
                {s.role} · {fmt(s.startsAt)} – {fmt(s.endsAt)}
              </span>
              <button
                type="button"
                disabled={busy === s.id}
                className="rounded-full bg-violet-600/80 px-3 py-1 text-[10px] font-semibold text-white disabled:opacity-40"
                onClick={() => void claim(s.id)}
              >
                Claim
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
