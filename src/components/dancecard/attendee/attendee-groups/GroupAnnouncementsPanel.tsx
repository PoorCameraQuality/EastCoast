'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'

type Ann = { id: string; body: string; pinned: boolean; createdAt: string; authorDisplayName: string }

export function GroupAnnouncementsPanel({ eventSlug, groupId }: { eventSlug: string; groupId: string }) {
  const [items, setItems] = useState<Ann[]>([])
  const [body, setBody] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    const d = await dancecardFetch<{ announcements: Ann[] }>(eventSlug, `/attendee-groups/${groupId}/announcements`)
    setItems(d.announcements ?? [])
  }, [eventSlug, groupId])

  useEffect(() => {
    void load().catch(() => setItems([]))
  }, [load])

  async function post(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/announcements`, {
        method: 'POST',
        body: JSON.stringify({ body: body.trim() }),
      })
      setBody('')
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <form onSubmit={(e) => void post(e)} className="space-y-2">
        <textarea
          className="w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Announcement to members…"
        />
        <button type="submit" className="rounded-lg bg-dc-accent px-3 py-1.5 text-xs font-semibold text-dc-accent-foreground">
          Post
        </button>
      </form>
      {err ? <p className="text-red-700">{err}</p> : null}
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="rounded-lg border border-dc-border px-3 py-2">
            <p className="text-xs text-dc-muted">
              {a.authorDisplayName} · {new Date(a.createdAt).toLocaleString()}
              {a.pinned ? ' · Pinned' : ''}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-dc-text">{a.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
