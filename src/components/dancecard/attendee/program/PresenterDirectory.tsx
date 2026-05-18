'use client'

import { buildPresenterIndex } from '@/lib/dancecard/attendee/scheduleSelectors'
import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { Panel } from '@/components/dancecard/ui/Panel'

type Props = {
  slots: ProgramSlot[]
  onSelectSlot?: (slotId: string) => void
}

export function PresenterDirectory({ slots, onSelectSlot }: Props) {
  const index = buildPresenterIndex(slots.map((s) => ({ id: s.id, presenters: s.presenters ?? [] })))
  if (!index.length) return null

  return (
    <Panel className="space-y-3">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Presenters</p>
      <ul className="max-h-48 space-y-2 overflow-y-auto">
        {index.map((p) => (
          <li key={`${p.sceneName}-${p.role}`} className="text-sm">
            <span className="font-semibold text-dc-text">{p.sceneName}</span>
            <span className="text-dc-muted"> · {p.role.replace(/_/g, ' ')}</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {p.slotIds.map((id) => {
                const slot = slots.find((s) => s.id === id)
                if (!slot) return null
                return (
                  <button
                    key={id}
                    type="button"
                    className="rounded-full border border-dc-border bg-dc-surface-muted px-2 py-0.5 text-dc-micro text-dc-muted hover:text-dc-accent"
                    onClick={() => onSelectSlot?.(id)}
                  >
                    {slot.title}
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
