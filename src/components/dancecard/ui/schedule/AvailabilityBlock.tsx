import type { ReactNode } from 'react'

export type AvailabilityTone = 'free' | 'busy' | 'mutual' | 'unknown'

const toneClass: Record<AvailabilityTone, { cell: string; icon: string; pattern: string }> = {
  free: {
    cell: 'border-dc-success/30 bg-dc-success-muted text-dc-success',
    icon: 'text-dc-success',
    pattern: 'bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(52,211,153,0.08)_4px,rgba(52,211,153,0.08)_8px)]',
  },
  busy: {
    cell: 'border-dc-danger-border bg-dc-danger-muted text-dc-danger',
    icon: 'text-dc-danger',
    pattern: 'bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(251,113,133,0.1)_4px,rgba(251,113,133,0.1)_8px)]',
  },
  mutual: {
    cell: 'border-dc-accent-border bg-dc-accent-muted text-dc-accent',
    icon: 'text-dc-accent',
    pattern: 'bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(45,212,191,0.1)_4px,rgba(45,212,191,0.1)_8px)]',
  },
  unknown: {
    cell: 'border-dc-border bg-dc-elevated-muted/50 text-dc-muted',
    icon: 'text-dc-muted',
    pattern: '',
  },
}

type Props = {
  tone: AvailabilityTone
  label: string
  icon?: ReactNode
  className?: string
}

export function AvailabilityBlock({ tone, label, icon, className = '' }: Props) {
  const t = toneClass[tone]
  return (
    <div
      className={`relative flex min-h-touch flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center text-dc-micro font-medium ${t.cell} ${className}`.trim()}
      title={label}
    >
      <span className={`pointer-events-none absolute inset-0 rounded-lg opacity-60 ${t.pattern}`} aria-hidden />
      {icon ? <span className={`relative z-[1] ${t.icon}`}>{icon}</span> : null}
      <span className="relative z-[1]">{label}</span>
    </div>
  )
}
