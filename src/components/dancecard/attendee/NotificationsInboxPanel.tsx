'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'
import { supportCopy } from '@/lib/dancecard/supportCopy'

type NotificationRow = {
  id: string
  kind: string
  payload: Record<string, unknown>
  status: string
  createdAt: string
}

function labelFor(n: NotificationRow): string {
  const p = n.payload
  switch (n.kind) {
    case 'reservation':
      return 'Someone reserved time on your dancecard'
    case 'schedule_change':
      return 'A class on your schedule changed'
    case 'reschedule':
      return `Reschedule request ${String(p.action ?? 'updated')}`
    case 'starting_soon':
      return String(p.title ?? 'Starting soon')
    default:
      return n.kind.replace(/_/g, ' ')
  }
}

export function NotificationsInboxPanel({ eventSlug }: { eventSlug: string }) {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [needsMigration, setNeedsMigration] = useState(false)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const d = await dancecardFetch<{ notifications: NotificationRow[]; needsMigration?: string }>(
        eventSlug,
        '/notifications',
      )
      setItems(d.notifications ?? [])
      setNeedsMigration(Boolean(d.needsMigration))
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function markAllRead() {
    await dancecardFetch(eventSlug, '/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ markAllRead: true }),
    })
    await load()
  }

  async function ack(id: string) {
    await dancecardFetch(eventSlug, `/notifications/${id}/ack`, { method: 'POST' })
    await load()
  }

  const unread = items.filter((i) => i.status === 'unread').length

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-dc-muted">Inbox</p>
          <p className="mt-1 text-sm text-dc-subtle">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            className="rounded-full border border-dc-border px-3 py-1 text-xs font-semibold text-dc-accent"
            onClick={() => void markAllRead()}
          >
            Mark all read
          </button>
        ) : null}
      </div>
      {needsMigration ? (
        <p className="mt-3 text-sm text-amber-800">{supportCopy.notificationsNotReady}</p>
      ) : null}
      {err ? <p className="mt-3 text-sm text-red-700">{err}</p> : null}
      <ul className="mt-4 space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={
              n.status === 'unread'
                ? 'rounded-xl border border-dc-accent-border/50 bg-dc-accent-muted/40 px-3 py-2'
                : 'rounded-xl border border-dc-border px-3 py-2'
            }
          >
            <p className="text-sm font-medium text-dc-text">{labelFor(n)}</p>
            <p className="mt-0.5 text-dc-micro text-dc-muted">{new Date(n.createdAt).toLocaleString()}</p>
            {n.status === 'unread' ? (
              <button type="button" className="mt-2 text-xs text-dc-accent underline" onClick={() => void ack(n.id)}>
                Mark read
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {!items.length && !err ? <p className="mt-4 text-sm text-dc-muted">No notifications yet.</p> : null}
    </Panel>
  )
}
