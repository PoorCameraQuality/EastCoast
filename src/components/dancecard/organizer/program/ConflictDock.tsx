'use client'

import type { DancecardConflict } from '@/lib/dancecard/conflictScanner'
import type { ProgramSlotRow } from '@/lib/dancecard/organizerProgramSlotDto'
import { Panel } from '@/components/dancecard/ui/Panel'
import { Button } from '@/components/dancecard/ui/Button'

type Props = {
  conflicts: DancecardConflict[]
  slots: ProgramSlotRow[]
  loading?: boolean
  onOpenSlot: (slotId: string, opts?: { editTab?: 'edit' | 'privacy' }) => void
  onOpenBoth: (a: string, b: string) => void
  onOpenScheduleCredits?: () => void
  onLaunchConflictGuide?: () => void
}

export function ConflictDock({
  conflicts,
  slots,
  loading = false,
  onOpenSlot,
  onOpenBoth,
  onOpenScheduleCredits,
  onLaunchConflictGuide,
}: Props) {
  if (loading) {
    return (
      <Panel variant="muted" className="text-sm text-dc-muted" aria-busy="true">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-dc-accent-border border-t-dc-accent animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          Scanning schedule for conflicts…
        </span>
      </Panel>
    )
  }

  if (!conflicts.length) {
    return (
      <Panel variant="muted" className="text-sm text-dc-muted">
        No schedule conflicts detected for rooms, presenters, or photo policy.
      </Panel>
    )
  }

  return (
    <Panel className="border-dc-warning/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-warning">
          Conflict dock · {conflicts.length}
        </p>
        <div className="flex flex-wrap gap-2 text-dc-micro">
          {onOpenScheduleCredits ? (
            <button type="button" className="text-dc-accent hover:underline" onClick={onOpenScheduleCredits}>
              Schedule credits
            </button>
          ) : null}
          {onLaunchConflictGuide ? (
            <button type="button" className="text-dc-muted hover:text-dc-text" onClick={onLaunchConflictGuide}>
              Conflict walkthrough
            </button>
          ) : null}
        </div>
      </div>
      <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto">
        {conflicts.map((c) => {
          const related = c.relatedSlotIds
          const a = related[0]
          const b = related[1]
          const slotA = slots.find((s) => s.id === a)
          const slotB = slots.find((s) => s.id === b)
          return (
            <li key={c.id} className="rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm">
              <p className="font-semibold text-dc-text">{c.title}</p>
              {c.detail ? <p className="mt-1 text-dc-micro text-dc-muted">{c.detail}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {a && slotA ? (
                  <Button type="button" variant="secondary" className="text-dc-micro" onClick={() => onOpenSlot(a)}>
                    Open {slotA.title.slice(0, 24)}
                  </Button>
                ) : null}
                {a && b ? (
                  <Button type="button" variant="secondary" className="text-dc-micro" onClick={() => onOpenBoth(a, b)}>
                    Open both
                  </Button>
                ) : null}
                {a ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-dc-micro"
                    onClick={() => onOpenSlot(a, { editTab: 'edit' })}
                  >
                    Nudge time
                  </Button>
                ) : null}
                {a ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-dc-micro"
                    onClick={() => onOpenSlot(a, { editTab: 'privacy' })}
                  >
                    Privacy
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
