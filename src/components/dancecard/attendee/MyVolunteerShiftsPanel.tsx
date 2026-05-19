'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'

type Shift = {
  id: string
  role: string
  startsAt: string
  endsAt: string
  status: string
  locationName: string | null
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function MyVolunteerShiftsPanel({ eventSlug }: { eventSlug: string }) {
  const [myShifts, setMyShifts] = useState<Shift[]>([])
  const [openShifts, setOpenShifts] = useState<Shift[]>([])
  const [compliance, setCompliance] = useState<{
    requiredHours: number
    claimedHours: number
    deficitHours: number
  } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await dancecardFetch<{
        myShifts: Shift[]
        openShifts: Shift[]
        compliance?: { requiredHours: number; claimedHours: number; deficitHours: number } | null
      }>(eventSlug, '/my-volunteer-shifts')
      setMyShifts(d.myShifts ?? [])
      setOpenShifts(d.openShifts ?? [])
      setCompliance(d.compliance ?? null)
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Panel className="space-y-4 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-dc-muted">My volunteer shifts</p>
        <p className="mt-1 text-sm text-dc-subtle">Shifts you are assigned or have claimed.</p>
      </div>
      {compliance && compliance.deficitHours > 0 ? (
        <p className="rounded-xl border border-amber-300/50 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
          You need {compliance.deficitHours} more volunteer hour{compliance.deficitHours === 1 ? '' : 's'} — browse open
          shifts below.
        </p>
      ) : null}
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <ul className="space-y-2">
        {myShifts.map((s) => (
          <li key={s.id} className="rounded-xl border border-dc-border px-3 py-2 text-sm">
            <p className="font-medium text-dc-text">{s.role}</p>
            <p className="text-xs text-dc-muted">{fmt(s.startsAt)}</p>
            {s.locationName ? <p className="text-xs text-dc-subtle">{s.locationName}</p> : null}
          </li>
        ))}
      </ul>
      {!myShifts.length ? <p className="text-sm text-dc-muted">No shifts yet.</p> : null}
      {openShifts.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase text-dc-muted">Open shifts</p>
          <ul className="mt-2 space-y-2">
            {openShifts.map((s) => (
              <li key={s.id} className="rounded-xl border border-dc-accent-border/40 bg-dc-accent-muted/30 px-3 py-2 text-sm">
                <p className="font-medium">{s.role}</p>
                <p className="text-xs text-dc-muted">{fmt(s.startsAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  )
}
