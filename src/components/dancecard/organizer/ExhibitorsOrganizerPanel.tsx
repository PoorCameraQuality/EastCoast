'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { Panel } from '@/components/dancecard/ui/Panel'

type Exhibitor = {
  id: string
  name: string
  booth: string | null
  hours: string | null
  description: string | null
  view_count: number
  is_published: boolean
}

export function ExhibitorsOrganizerPanel({ eventSlug, readOnly }: { eventSlug: string; readOnly: boolean }) {
  const [rows, setRows] = useState<Exhibitor[]>([])
  const [name, setName] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await organizerDancecardFetch<{ exhibitors: Exhibitor[] }>(eventSlug, '/exhibitors')
      setRows(d.exhibitors ?? [])
      setErr(null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load exhibitors')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function add() {
    if (!name.trim() || readOnly) return
    await organizerDancecardFetch(eventSlug, '/exhibitors', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    })
    setName('')
    await load()
  }

  return (
    <Panel className="space-y-4 p-4">
      <h3 className="font-serif text-lg text-dc-text">Exhibitor directory</h3>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      {!readOnly ? (
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-dc-border px-3 py-2 text-sm"
            placeholder="Exhibitor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground"
            onClick={() => void add()}
          >
            Add
          </button>
        </div>
      ) : null}
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between gap-2 rounded-xl border border-dc-border px-3 py-2">
            <span>
              <span className="font-medium text-dc-text">{r.name}</span>
              {r.booth ? <span className="ml-2 text-xs text-dc-muted">Booth {r.booth}</span> : null}
            </span>
            <span className="text-xs text-dc-muted">{r.view_count} views</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
