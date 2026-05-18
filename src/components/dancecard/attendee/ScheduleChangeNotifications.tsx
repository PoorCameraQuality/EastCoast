'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'

type NotificationRow = {
  id: string
  conflict_summary: string | null
  status: string
  created_at: string
}

export function ScheduleChangeNotifications({ eventSlug }: { eventSlug: string }) {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await dancecardFetch<{ notifications: NotificationRow[] }>(eventSlug, '/schedule-change-notifications')
      setItems(res.notifications ?? [])
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function ack(id: string, dismissed: boolean) {
    setBusy(id)
    try {
      await dancecardFetch(eventSlug, `/schedule-change-notifications/${encodeURIComponent(id)}/ack`, {
        method: 'POST',
        body: JSON.stringify({ status: dismissed ? 'dismissed' : 'acknowledged' }),
      })
      setItems((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (!items.length && !err) return null

  return (
    <div className="mb-3 space-y-2 rounded-xl border border-amber-400/30 bg-amber-950/25 p-3 text-sm text-amber-50">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">Schedule updates</p>
      {err ? <p className="text-xs text-rose-300">{err}</p> : null}
      {items.map((n) => (
        <div key={n.id} className="rounded-lg border border-amber-300/20 bg-black/20 px-3 py-2">
          <p className="text-xs text-amber-50/95">
            {n.conflict_summary?.trim() || 'An activity on your dancecard may have changed.'}
          </p>
          <p className="mt-1 text-[10px] text-amber-200/60">{new Date(n.created_at).toLocaleString()}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy === n.id}
              className="rounded-full bg-amber-600/80 px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-40"
              onClick={() => void ack(n.id, false)}
            >
              Got it
            </button>
            <button
              type="button"
              disabled={busy === n.id}
              className="rounded-full border border-amber-200/30 px-2 py-0.5 text-[10px] text-amber-100 disabled:opacity-40"
              onClick={() => void ack(n.id, true)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
