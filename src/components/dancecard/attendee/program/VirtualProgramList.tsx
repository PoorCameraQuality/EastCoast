'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { SessionCard as UiSessionCard } from '@/components/dancecard/ui/schedule/SessionCard'
import { PhotoPolicyChip } from '@/components/dancecard/attendee/PhotoPolicyChip'
import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { formatRange } from '@/components/dancecard/time'
import { programSlotDisplayRoom } from '@/lib/dancecard/programSlotDisplayRoom'

type Props = {
  slots: ProgramSlot[]
  timezone: string
  selectedIds: Set<string>
  onToggle: (slot: ProgramSlot) => void
  onOpenDetail?: (slot: ProgramSlot) => void
}

export function VirtualProgramList({ slots, timezone, selectedIds, onToggle, onOpenDetail }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: slots.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96,
    overscan: 6,
  })

  return (
    <div ref={parentRef} className="max-h-[min(70vh,640px)] overflow-y-auto rounded-xl border border-dc-border">
      <ul className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((row) => {
          const slot = slots[row.index]!
          const room = programSlotDisplayRoom(slot)
          return (
            <li
              key={slot.id}
              className="absolute left-0 top-0 w-full px-2 py-1"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              <div
                className={`flex items-stretch gap-2 rounded-2xl border border-dc-border bg-dc-elevated/90 p-1 ${
                  selectedIds.has(slot.id) ? 'ring-2 ring-dc-accent-border' : ''
                }`}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent"
                  onClick={() => onOpenDetail?.(slot)}
                >
                  <UiSessionCard
                    title={slot.title}
                    timeLabel={formatRange(slot.startsAt, slot.endsAt, timezone)}
                    room={room}
                    chip={<PhotoPolicyChip policy={slot.photoPolicy} />}
                    className="border-0 bg-transparent p-3 shadow-none ring-0"
                  />
                </button>
                <button
                  type="button"
                  aria-pressed={selectedIds.has(slot.id)}
                  aria-label={selectedIds.has(slot.id) ? 'Remove from my dancecard' : 'Add to my dancecard'}
                  className="shrink-0 self-center rounded-xl border border-dc-border px-3 py-2 text-xs font-semibold text-dc-text hover:bg-dc-elevated-muted"
                  onClick={() => onToggle(slot)}
                >
                  {selectedIds.has(slot.id) ? 'Added' : 'Add'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
