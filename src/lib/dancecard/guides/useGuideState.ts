'use client'

import { useCallback, useEffect, useState } from 'react'
import { type GuideId, guideStorageKey } from './guideKeys'

/** Guides are opt-in: absent or "1" = dismissed; "0" = show tour. */
function readDismissed(key: string) {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(key) !== '0'
}

export function useGuideState(eventSlug: string, guideId: GuideId) {
  const key = guideStorageKey(eventSlug, guideId)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(readDismissed(key))
  }, [key])

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, '1')
    setDismissed(true)
  }, [key])

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, '0')
    setDismissed(false)
  }, [key])

  return { dismissed, dismiss, reset, active: !dismissed }
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
