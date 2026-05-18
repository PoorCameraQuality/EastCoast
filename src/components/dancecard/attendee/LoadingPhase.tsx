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
}: {
  phase: LoadingPhaseId
  subtitle?: string
}) {
  return (
    <section className="relative mx-auto flex max-w-lg flex-col items-center gap-3 text-center text-sm text-dc-muted">
      <span
        className="inline-block h-9 w-9 rounded-full border-2 border-dc-accent-border border-t-dc-accent animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <span>{LABELS[phase]}</span>
      {subtitle ? <span className="text-dc-micro text-dc-muted">{subtitle}</span> : null}
    </section>
  )
}
