'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { SessionCard as UiSessionCard } from '@/components/dancecard/ui/schedule/SessionCard'
import { PhotoPolicyChip } from '@/components/dancecard/attendee/PhotoPolicyChip'
import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { formatRange } from '@/components/dancecard/time'

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
          const room = slot.locationName ?? slot.room
          return (
            <li
              key={slot.id}
              className="absolute left-0 top-0 w-full px-2 py-1"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              <UiSessionCard
                title={slot.title}
                timeLabel={formatRange(slot.startsAt, slot.endsAt, timezone)}
                room={room}
                active={selectedIds.has(slot.id)}
                chip={<PhotoPolicyChip policy={slot.photoPolicy} />}
                onClick={() => {
                  onOpenDetail?.(slot)
                  onToggle(slot)
                }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
