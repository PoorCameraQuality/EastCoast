'use client'

import type { PublicProgramSlotDto } from '@/lib/dancecard/publicProgramSlotsData'
import { happeningNow, nextUp } from '@/lib/dancecard/attendee/scheduleSelectors'
import { useDancecardHallwayMode } from '@/components/dancecard/DancecardThemeProvider'
import { useGuideState } from '@/lib/dancecard/guides/useGuideState'
import { cn } from '@/lib/cn'

type Props = {
  eventSlug: string
  slots: PublicProgramSlotDto[]
  timezone: string
  onSelectSlot?: (slotId: string) => void
}

function formatTime(iso: string, tz: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz,
  }).format(new Date(iso))
}

export function HappeningNowRibbon({ eventSlug, slots, timezone, onSelectSlot }: Props) {
  const hallway = useDancecardHallwayMode()
  const { dismissed, dismiss, active } = useGuideState(eventSlug, 'happening-now')
  const now = happeningNow(slots)
  const upcoming = nextUp(slots)
  const highlight = now ?? upcoming
  if (!highlight) return null

  const label = now ? 'Happening now' : 'Up next'

  return (
    <button
      type="button"
      className={cn(
        'dc-hallway-target mb-4 flex w-full items-center gap-3 rounded-xl border border-dc-accent-border bg-dc-accent-muted px-4 py-3 text-left dc-transition-tab hover:bg-dc-accent-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent',
        active && !dismissed && 'ring-2 ring-dc-accent',
      )}
      onClick={() => {
        if (active && !dismissed) dismiss()
        hallway?.setHallway(true)
        onSelectSlot?.(highlight.id)
      }}
    >
      <span className="text-dc-micro font-semibold uppercase tracking-wide text-dc-accent">
        {active && !dismissed ? `${label} — tap to continue` : label}
      </span>
      <span className="dc-session-title dc-privacy-sensitive flex-1 text-sm font-semibold text-dc-text">{highlight.title}</span>
      <span className="font-tabular text-dc-micro text-dc-muted">
        {formatTime(highlight.startsAt, timezone)} – {formatTime(highlight.endsAt, timezone)}
      </span>
    </button>
  )
}
