'use client'

import { useEffect, useState } from 'react'

type Slot = { id: string; title: string; startsAt: string }

const SOON_MS = 15 * 60_000
const DISMISS_KEY = 'eck_dc_soon_dismiss'

export function StartingSoonBanner({
  slots,
  selectedIds,
}: {
  slots: Slot[]
  selectedIds: Set<string>
}) {
  const [next, setNext] = useState<Slot | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      let best: Slot | null = null
      let bestDelta = Infinity
      for (const s of slots) {
        if (!selectedIds.has(s.id)) continue
        const start = Date.parse(s.startsAt)
        if (Number.isNaN(start)) continue
        const delta = start - now
        if (delta <= 0 || delta > SOON_MS) continue
        if (dismissed.has(s.id)) continue
        try {
          if (sessionStorage.getItem(`${DISMISS_KEY}:${s.id}`)) continue
        } catch {
          /* ignore */
        }
        if (delta < bestDelta) {
          bestDelta = delta
          best = s
        }
      }
      setNext(best)
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [slots, selectedIds, dismissed])

  if (!next) return null

  const mins = Math.max(1, Math.round((Date.parse(next.startsAt) - Date.now()) / 60_000))

  function dismiss() {
    try {
      sessionStorage.setItem(`${DISMISS_KEY}:${next!.id}`, '1')
    } catch {
      /* ignore */
    }
    setDismissed((prev) => new Set(prev).add(next!.id))
    setNext(null)
  }

  return (
    <div className="sticky top-12 z-[41] border-b border-dc-accent-border/60 bg-dc-accent-muted/90 px-3 py-2 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 text-sm">
        <p className="text-dc-text">
          Starts in <strong>{mins}</strong> min · {next.title}
        </p>
        <button type="button" className="shrink-0 text-xs text-dc-muted underline" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
