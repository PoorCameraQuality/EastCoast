'use client'

import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { formatRange } from '@/components/dancecard/time'
import { Panel } from '@/components/dancecard/ui/Panel'
import { WalkingTimeWhisper } from '@/components/dancecard/attendee/WalkingTimeWhisper'

type Selection = {
  slotId: string | null
  startsAt: string
  endsAt: string
  programTitle?: string | null
  programRoom?: string | null
}

type Props = {
  slots: ProgramSlot[]
  selections: Selection[]
  selectedIds: Set<string>
  timezone: string
  onToggle: (slot: ProgramSlot) => void
}

export function MyScheduleView({ slots, selections, selectedIds, timezone, onToggle }: Props) {
  const selected = slots
    .filter((s) => selectedIds.has(s.id))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  const manual = selections.filter((s) => !s.slotId && s.programTitle)

  if (!selected.length && !manual.length) {
    return (
      <Panel variant="muted" className="text-sm text-dc-muted">
        Nothing on your dancecard yet. Tap activities in the program to add them.
      </Panel>
    )
  }

  return (
    <Panel className="space-y-2">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">My schedule</p>
      <ul className="divide-y divide-dc-border">
        {selected.map((slot, idx) => (
          <li key={slot.id}>
            {idx > 0 ? (
              <WalkingTimeWhisper
                fromLabel={selected[idx - 1]!.locationName ?? selected[idx - 1]!.room ?? 'Previous room'}
                toLabel={slot.locationName ?? slot.room ?? 'Next room'}
              />
            ) : null}
            <div className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <p className="dc-privacy-sensitive truncate text-sm font-semibold text-dc-text">{slot.title}</p>
              <p className="text-dc-micro text-dc-muted">
                {formatRange(slot.startsAt, slot.endsAt, timezone)}
                {slot.locationName ?? slot.room ? ` · ${slot.locationName ?? slot.room}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="dc-hallway-touch shrink-0 rounded-full border border-dc-border px-3 py-1 text-dc-micro font-semibold text-dc-muted hover:text-dc-text"
              onClick={() => onToggle(slot)}
            >
              Remove
            </button>
            </div>
          </li>
        ))}
        {manual.map((m, i) => (
          <li key={`manual-${i}`} className="py-2 text-sm text-dc-muted">
            {m.programTitle} · {formatRange(m.startsAt, m.endsAt, timezone)}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
