'use client'

import { useState } from 'react'
import EckeLink from '@/components/EckeLink'
import { parseLocalDate } from '@/lib/calendarVisual'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

const PREVIEW_COUNT = 8

function eventWhen(event: PublicEventIndexItem) {
  const start = parseLocalDate(event.startsAt)
  if (Number.isNaN(start.getTime())) return event.dateDisplay
  return start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

type Props = {
  events: PublicEventIndexItem[]
}

export default function PlaceUpcomingNights({ events }: Props) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? events : events.slice(0, PREVIEW_COUNT)
  const hiddenCount = Math.max(0, events.length - PREVIEW_COUNT)

  return (
    <div className="place-upcoming-nights">
      <ul className="place-events-list">
        {visible.map((event) => (
          <li key={event.slug}>
            <EckeLink href={`/events/${event.slug}`} className="place-event-row">
              <span className="place-event-date">{eventWhen(event)}</span>
              <span className="place-event-copy">
                <span className="place-event-title">{event.title}</span>
                <span className="place-event-location">
                  {event.city}, {event.state}
                </span>
              </span>
            </EckeLink>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="place-events-more"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show fewer nights' : `Show ${hiddenCount} more nights`}
        </button>
      ) : null}
    </div>
  )
}
