'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'

type Row = {
  id: string
  status: string
  direction: 'incoming' | 'outgoing'
  proposedStartsAt: string
  proposedEndsAt: string
  note: string | null
  requester: { displayName: string; username: string }
  recipient: { displayName: string; username: string }
}

export function RescheduleInboxPanel({ eventSlug }: { eventSlug: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await dancecardFetch<{ requests: Row[] }>(eventSlug, '/reschedule-requests')
      setRows(d.requests ?? [])
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function respond(id: string, action: 'accept' | 'decline' | 'cancel') {
    setBusy(id)
    try {
      await dancecardFetch(eventSlug, `/reschedule-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      })
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (err) return <p className="text-sm text-red-700">{err}</p>
  if (!rows.length) return <p className="text-sm text-dc-muted">No reschedule requests.</p>

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="rounded-xl border border-dc-border bg-dc-elevated-muted/50 p-3 text-sm">
          <p className="font-medium text-dc-text">
            {r.direction === 'incoming'
              ? `${r.requester.displayName} proposed a new time`
              : `You proposed to ${r.recipient.displayName}`}
          </p>
          <p className="mt-1 text-xs text-dc-muted">
            {new Date(r.proposedStartsAt).toLocaleString()} – {new Date(r.proposedEndsAt).toLocaleTimeString()}
          </p>
          {r.note ? <p className="mt-1 text-dc-subtle">{r.note}</p> : null}
          <p className="mt-1 text-xs uppercase text-dc-muted">{r.status}</p>
          {r.status === 'pending' ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {r.direction === 'incoming' ? (
                <>
                  <button
                    type="button"
                    disabled={busy === r.id}
                    className="rounded-lg bg-dc-accent px-3 py-1 text-xs font-semibold text-dc-accent-foreground"
                    onClick={() => void respond(r.id, 'accept')}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={busy === r.id}
                    className="rounded-lg border border-dc-border px-3 py-1 text-xs"
                    onClick={() => void respond(r.id, 'decline')}
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy === r.id}
                  className="rounded-lg border border-dc-border px-3 py-1 text-xs"
                  onClick={() => void respond(r.id, 'cancel')}
                >
                  Cancel request
                </button>
              )}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
