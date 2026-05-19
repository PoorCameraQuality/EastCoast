'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'

type Entry = { accountId: string; username: string; sceneName: string; attending?: boolean }

export function AttendeeDirectoryPanel({
  eventSlug,
  onPickUsername,
}: {
  eventSlug: string
  onPickUsername?: (username: string) => void
}) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [attendingOnly, setAttendingOnly] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const q = attendingOnly ? '?attending=1' : ''
      const d = await dancecardFetch<{ entries: Entry[] }>(eventSlug, `/attendees/directory${q}`)
      setEntries(d.entries ?? [])
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug, attendingOnly])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Panel className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-dc-muted">Event directory</p>
        <label className="flex items-center gap-2 text-xs text-dc-muted">
          <input type="checkbox" checked={attendingOnly} onChange={(e) => setAttendingOnly(e.target.checked)} />
          Attending only
        </label>
      </div>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.accountId} className="flex items-center justify-between gap-2 rounded-xl border border-dc-border px-3 py-2 text-sm">
            <span>
              <span className="font-medium text-dc-text">{e.sceneName}</span>
              <span className="ml-2 text-xs text-dc-muted">@{e.username}</span>
              {e.attending ? (
                <span className="ml-2 rounded-full bg-dc-accent-muted px-2 py-0.5 text-[10px] text-dc-accent">Attending</span>
              ) : null}
            </span>
            {onPickUsername ? (
              <button
                type="button"
                className="text-xs text-dc-accent hover:underline"
                onClick={() => onPickUsername(e.username)}
              >
                Compare
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {!entries.length ? <p className="text-sm text-dc-muted">No one has opted into the directory yet.</p> : null}
    </Panel>
  )
}
