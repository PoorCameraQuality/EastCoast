'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'

type Props = {
  eventSlug: string
  enabled: boolean
  slotLabels: Record<string, string>
}

export function SessionFeedbackPanel({ eventSlug, enabled, slotLabels }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string[]>([])
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState('')
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    try {
      const d = await dancecardFetch<{ open: boolean; pendingSlotIds: string[] }>(eventSlug, '/session-feedback')
      setOpen(d.open)
      setPending(d.pendingSlotIds ?? [])
    } catch {
      setOpen(false)
      setPending([])
    }
  }, [eventSlug, enabled])

  useEffect(() => {
    void load()
  }, [load])

  if (!enabled || !open || !pending.length) return null

  const slotId = activeSlot ?? pending[0]

  async function submit() {
    if (!slotId) return
    try {
      await dancecardFetch(eventSlug, '/session-feedback', {
        method: 'POST',
        body: JSON.stringify({ programSlotId: slotId, rating, comment: comment.trim() || undefined }),
      })
      setComment('')
      setActiveSlot(null)
      await load()
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  return (
    <Panel className="space-y-2">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Session feedback</p>
      <p className="text-xs text-dc-subtle">Help shape next year&apos;s program. Ratings are for organizers only.</p>
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
      <label className="block text-xs text-dc-muted">
        Session
        <select
          className="mt-1 block w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
          value={slotId}
          onChange={(e) => setActiveSlot(e.target.value)}
        >
          {pending.map((id) => (
            <option key={id} value={id}>
              {slotLabels[id] ?? id.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs text-dc-muted">
        Rating
        <input
          type="range"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </label>
      <textarea
        className="w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
        rows={2}
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        type="button"
        className="rounded-lg bg-dc-accent px-3 py-1.5 text-xs font-semibold text-dc-accent-foreground"
        onClick={() => void submit()}
      >
        Submit feedback
      </button>
    </Panel>
  )
}
