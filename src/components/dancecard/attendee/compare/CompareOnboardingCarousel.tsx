'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/dancecard/ui/Button'
import { Panel } from '@/components/dancecard/ui/Panel'

const SLIDES = [
  {
    title: 'Compare without spreadsheets',
    body: 'Enter a login name or paste a share link. You stay on your account; their free time appears as colored strips.',
  },
  {
    title: 'Green means mutual',
    body: 'Host busy time is red, free time is green. Overlapping green blocks are times you can both meet.',
  },
  {
    title: 'Reserve together',
    body: 'Tap a mutual gap to start a reservation. Privacy settings in My availability control username compare.',
  },
]

const STORAGE_KEY = 'dc-compare-onboarding-v1'

export function CompareOnboardingCarousel({ eventSlug }: { eventSlug: string }) {
  const storageKey = `${STORAGE_KEY}-${eventSlug}`
  const [dismissed, setDismissed] = useState(true)
  useEffect(() => {
    setDismissed(window.localStorage.getItem(storageKey) === '1')
  }, [storageKey])
  const [idx, setIdx] = useState(0)

  if (dismissed) return null

  const slide = SLIDES[idx]!

  function dismiss() {
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, '1')
    setDismissed(true)
  }

  return (
    <Panel variant="muted" className="border-dc-accent-border/40">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-accent">
        Compare · {idx + 1}/{SLIDES.length}
      </p>
      <h3 className="mt-2 text-base font-semibold text-dc-text">{slide.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-dc-muted">{slide.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {idx < SLIDES.length - 1 ? (
          <Button type="button" variant="primary" onClick={() => setIdx((i) => i + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" variant="primary" onClick={dismiss}>
            Got it
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={dismiss}>
          Skip
        </Button>
      </div>
    </Panel>
  )
}
