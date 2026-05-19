'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'

type Incoming = {
  id: string
  message: string | null
  createdAt: string
  from: { username: string; sceneName: string }
}

type Props = {
  eventSlug: string
  onAccepted: (username: string) => void
  onCountChange?: (n: number) => void
}

export function CompareRequestsInbox({ eventSlug, onAccepted, onCountChange }: Props) {
  const [incoming, setIncoming] = useState<Incoming[]>([])

  const load = useCallback(async () => {
    try {
      const d = await dancecardFetch<{ incoming: Incoming[] }>(eventSlug, '/compare/requests')
      const list = d.incoming ?? []
      setIncoming(list)
      onCountChange?.(list.length)
    } catch {
      setIncoming([])
      onCountChange?.(0)
    }
  }, [eventSlug, onCountChange])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), 60_000)
    return () => window.clearInterval(id)
  }, [load])

  async function respond(requestId: string, action: 'accept' | 'decline') {
    try {
      const res = await dancecardFetch<{ compareUsername?: string | null }>(
        eventSlug,
        `/compare/requests/${requestId}/respond`,
        { method: 'POST', body: JSON.stringify({ action }) }
      )
      if (action === 'accept' && res.compareUsername) onAccepted(res.compareUsername)
      await load()
    } catch (e) {
      alert(formatDancecardApiMessage(e))
    }
  }

  if (!incoming.length) return null

  return (
    <Panel className="space-y-2">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Compare requests</p>
      <ul className="space-y-2">
        {incoming.map((r) => (
          <li key={r.id} className="rounded-xl border border-dc-border bg-dc-elevated-muted/80 p-2 text-sm">
            <p className="font-semibold text-dc-text">{r.from.sceneName}</p>
            <p className="text-xs text-dc-muted">@{r.from.username}</p>
            {r.message ? <p className="mt-1 text-xs text-dc-subtle">{r.message}</p> : null}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-dc-accent px-2 py-1 text-[11px] font-semibold text-dc-accent-foreground"
                onClick={() => void respond(r.id, 'accept')}
              >
                Accept
              </button>
              <button
                type="button"
                className="rounded-lg border border-dc-border px-2 py-1 text-[11px]"
                onClick={() => void respond(r.id, 'decline')}
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
