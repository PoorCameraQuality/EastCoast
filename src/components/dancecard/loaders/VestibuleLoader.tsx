'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/lib/dancecard/guides/useGuideState'
import { cn } from '@/lib/cn'

export type VestibuleVariant = 'organizer-doors' | 'attendee-shuffle' | 'import-dissolve'

const COPY: Record<VestibuleVariant, { title: string; tips: string[] }> = {
  'organizer-doors': {
    title: 'Opening the call board',
    tips: [
      'Programming: drag an activity—conflicts show in amber.',
      'Use the conflict dock to fix overlaps fast.',
      'Preview as attendee before you publish.',
    ],
  },
  'attendee-shuffle': {
    title: 'Shuffling your dancecard',
    tips: [
      'Your schedule is private until you share.',
      'Compare finds mutual free time with friends.',
      'Hallway mode helps in dim venues.',
    ],
  },
  'import-dissolve': {
    title: 'Dissolving your spreadsheet',
    tips: ['Validating rows…', 'Mapping columns…', 'Queuing conflicts…'],
  },
}

export function VestibuleLoader({
  variant,
  onComplete,
  maxMs = 1200,
}: {
  variant: VestibuleVariant
  onComplete: () => void
  maxMs?: number
}) {
  const [tipIdx, setTipIdx] = useState(0)
  const reduced = prefersReducedMotion()
  const meta = COPY[variant]

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(onComplete, 400)
      return () => window.clearTimeout(t)
    }
    const tipTimer = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % meta.tips.length)
    }, 400)
    const done = window.setTimeout(onComplete, maxMs)
    return () => {
      window.clearInterval(tipTimer)
      window.clearTimeout(done)
    }
  }, [reduced, maxMs, meta.tips.length, onComplete])

  return (
    <div
      className="dc-vestibule flex flex-col items-center justify-center gap-4 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'h-16 w-16 rounded-2xl border-2 border-dc-accent-border bg-dc-accent-muted',
          !reduced && variant === 'organizer-doors' && 'dc-vestibule-pulse',
          !reduced && variant === 'attendee-shuffle' && 'dc-vestibule-fan',
        )}
        aria-hidden
      />
      <p className="font-serif text-lg text-dc-text">{meta.title}</p>
      <p className="max-w-sm text-sm text-dc-muted">{meta.tips[tipIdx]}</p>
      <button
        type="button"
        className="text-dc-micro text-dc-accent hover:underline"
        onClick={onComplete}
      >
        Skip
      </button>
    </div>
  )
}
