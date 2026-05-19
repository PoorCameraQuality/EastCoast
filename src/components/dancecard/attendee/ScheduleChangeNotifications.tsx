'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'

type ConflictSummary = { message?: string; kinds?: string[] } | string | null

type NotificationRow = {
  id: string
  conflict_summary: ConflictSummary
  old_snapshot?: Record<string, unknown> | null
  new_snapshot?: Record<string, unknown> | null
  status: string
  created_at: string
}

function snapshotLine(snap: Record<string, unknown> | null | undefined): string {
  if (!snap) return ''
  const title = String(snap.title ?? '').trim()
  const startsAt = snap.startsAt ?? snap.starts_at
  const room = snap.locationName ?? snap.room
  const parts: string[] = []
  if (title) parts.push(title)
  if (startsAt) parts.push(String(startsAt))
  if (room) parts.push(String(room))
  return parts.join(' · ')
}

function messageFromSnapshots(row: NotificationRow): string | null {
  const oldLine = snapshotLine(row.old_snapshot ?? null)
  const newLine = snapshotLine(row.new_snapshot ?? null)
  if (!oldLine && !newLine) return null
  if (oldLine && newLine && oldLine !== newLine) {
    return `Schedule updated: was "${oldLine}" — now "${newLine}". My dancecard may still show the old time.`
  }
  return newLine ? `Schedule updated: ${newLine}. My dancecard may still show the old time.` : null
}

export function parseScheduleChangeNotificationMessage(row: NotificationRow): string {
  const cs = row.conflict_summary
  if (typeof cs === 'string' && cs.trim()) return cs.trim()
  if (cs && typeof cs === 'object' && typeof cs.message === 'string' && cs.message.trim()) {
    return cs.message.trim()
  }
  return messageFromSnapshots(row) ?? 'An activity on your dancecard may have changed.'
}

export function ScheduleChangeNotifications({
  eventSlug,
  onUnreadCount,
}: {
  eventSlug: string
  onUnreadCount?: (count: number) => void
}) {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await dancecardFetch<{ notifications: NotificationRow[] }>(eventSlug, '/schedule-change-notifications')
      const list = res.notifications ?? []
      setItems(list)
      onUnreadCount?.(list.length)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
      onUnreadCount?.(0)
    }
  }, [eventSlug, onUnreadCount])

  useEffect(() => {
    void load()
    const onVis = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVis)
    const interval = window.setInterval(() => void load(), 120_000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.clearInterval(interval)
    }
  }, [load])

  async function ack(id: string, dismissed: boolean) {
    setBusy(id)
    try {
      await dancecardFetch(eventSlug, `/schedule-change-notifications/${encodeURIComponent(id)}/ack`, {
        method: 'POST',
        body: JSON.stringify({ status: dismissed ? 'dismissed' : 'acknowledged' }),
      })
      setItems((prev) => {
        const next = prev.filter((n) => n.id !== id)
        onUnreadCount?.(next.length)
        return next
      })
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (!items.length && !err) return null

  return (
    <div className="mb-3 space-y-2 rounded-xl border border-amber-400/30 bg-amber-100 p-3 text-sm text-amber-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">Schedule updates</p>
      {err ? <p className="text-xs text-red-700">{err}</p> : null}
      {items.map((n) => (
        <div key={n.id} className="rounded-lg border border-amber-300/20 bg-dc-elevated-muted px-3 py-2">
          <p className="text-xs text-amber-900/95">{parseScheduleChangeNotificationMessage(n)}</p>
          <p className="mt-1 text-[10px] text-amber-800/60">{new Date(n.created_at).toLocaleString()}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy === n.id}
              className="rounded-full bg-amber-600/80 px-2 py-0.5 text-[10px] font-semibold text-dc-text disabled:opacity-40"
              onClick={() => void ack(n.id, false)}
            >
              Got it
            </button>
            <button
              type="button"
              disabled={busy === n.id}
              className="rounded-full border border-amber-200/30 px-2 py-0.5 text-[10px] text-amber-900 disabled:opacity-40"
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

