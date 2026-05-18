'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  open: boolean
  title: string
  body: ReactNode
  step?: string
  targetSelector?: string
  onNext?: () => void
  onSkip?: () => void
  nextLabel?: string
  showGhostHint?: boolean
}

export function TutorialOverlay({
  open,
  title,
  body,
  step,
  targetSelector,
  onNext,
  onSkip,
  nextLabel = 'Next',
  showGhostHint,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onSkip])

  useEffect(() => {
    if (!open || !targetSelector) return
    const el = document.querySelector(targetSelector)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [open, targetSelector])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-dc-modal flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dc-tutorial-title"
    >
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Dismiss tutorial" onClick={onSkip} />
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl border border-dc-border bg-dc-elevated p-5 shadow-xl',
          showGhostHint && 'dc-animate-fade-in',
        )}
      >
        {step ? <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">{step}</p> : null}
        <h2 id="dc-tutorial-title" className="mt-1 font-serif text-lg text-dc-text">
          {title}
        </h2>
        <div className="mt-2 text-sm text-dc-muted">{body}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {onSkip ? (
            <button
              type="button"
              className="rounded-full border border-dc-border px-4 py-2 text-sm text-dc-muted hover:bg-dc-surface-muted"
              onClick={onSkip}
            >
              Skip
            </button>
          ) : null}
          {onNext ? (
            <button
              type="button"
              className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              onClick={onNext}
            >
              {nextLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
