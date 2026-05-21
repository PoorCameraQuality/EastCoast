'use client'

export type LoadingPhaseId = 'gate' | 'schedule' | 'session'

const LABELS: Record<LoadingPhaseId, string> = {
  gate: 'Checking access',
  schedule: 'Loading schedule',
  session: 'Restoring your session',
}

export function LoadingPhase({
  phase,
  subtitle,
  fullBleed = false,
}: {
  phase: LoadingPhaseId
  subtitle?: string
  /** Center in a full-viewport loading screen with branded backdrop. */
  fullBleed?: boolean
}) {
  const inner = (
    <section
      className="relative mx-auto flex max-w-lg flex-col items-center gap-4 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="inline-block h-10 w-10 rounded-full border-2 border-dc-accent-border border-t-dc-accent animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <div>
        <p className="font-serif text-lg text-dc-text">{LABELS[phase]}</p>
        <p className="mt-1 text-sm text-dc-muted">Syncing with the event server…</p>
        {subtitle ? <p className="mt-2 text-dc-micro text-dc-muted">{subtitle}</p> : null}
      </div>
      <div className="dc-skeleton-stagger flex w-full max-w-xs flex-col gap-2 pt-2">
        <div className="dc-skeleton-bone h-2 w-full animate-pulse rounded motion-reduce:animate-none" />
        <div className="dc-skeleton-bone h-2 w-4/5 animate-pulse rounded motion-reduce:animate-none" />
        <div className="dc-skeleton-bone h-2 w-3/5 animate-pulse rounded motion-reduce:animate-none" />
      </div>
    </section>
  )

  if (!fullBleed) return inner

  return (
    <div className="relative flex min-h-[50vh] items-center justify-center px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.14),transparent_32%),linear-gradient(180deg,var(--dc-surface)_0%,var(--dc-surface-muted)_100%)]" />
      <div className="relative w-full">{inner}</div>
    </div>
  )
}
