'use client'

import { useMemo, useState } from 'react'
import EckeLink from '@/components/EckeLink'
import CalendarEventRow from '@/components/calendar/CalendarEventRow'
import { eventLocationLine } from '@/lib/publicEventIndex'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type Props = {
  events: PublicEventIndexItem[]
  conventions: PublicEventIndexItem[]
  stateName: string
  stateSlug: string
}

const PAGE_SIZE = 8

export default function StateEventRunway({ events, conventions, stateName, stateSlug }: Props) {
  const featured = conventions[0] ?? events[0]
  const rest = useMemo(() => {
    return [...conventions.slice(featured && conventions[0] === featured ? 1 : 0), ...events].filter(
      (e) => e.slug !== featured?.slug,
    )
  }, [conventions, events, featured])

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visible = rest.slice(0, visibleCount)
  const remaining = Math.max(0, rest.length - visible.length)
  const totalUpcoming = (featured ? 1 : 0) + rest.length

  if (!featured && rest.length === 0) {
    return (
      <section className="st-section" aria-labelledby="st-events">
        <h2 id="st-events" className="st-section-title">
          Upcoming events in {stateName}
        </h2>
        <div className="st-empty">
          No upcoming events listed for {stateName} yet.{' '}
          <EckeLink href="/events" className="text-violet-300 underline">
            Browse all events
          </EckeLink>
        </div>
      </section>
    )
  }

  return (
    <section className="st-section" aria-labelledby="st-events">
      <div className="st-section-head">
        <h2 id="st-events" className="st-section-title">
          Upcoming events &amp; conventions
        </h2>
        <EckeLink href={`/bdsm-events/${stateSlug}`} className="st-btn-violet">
          All {stateName} events
        </EckeLink>
      </div>
      {featured ? (
        <EckeLink href={`/events/${featured.slug}`} className="st-featured-event block mb-3">
          <p className="st-featured-event-label">
            {featured.listingKind === 'convention' ? 'Featured convention' : 'Featured event'}
          </p>
          <p className="st-featured-event-title">{featured.title}</p>
          <p className="st-listing-meta mt-1">
            {featured.dateDisplay} · {eventLocationLine(featured)}
          </p>
        </EckeLink>
      ) : null}
      <div className="st-event-runway">
        {visible.map((item) => (
          <CalendarEventRow key={item.slug} item={item} />
        ))}
      </div>
      {rest.length > 0 ? (
        <div className="st-event-runway-pager">
          <p className="st-event-runway-count">
            Showing {visible.length}
            {featured ? ` + featured` : ''} of {totalUpcoming} upcoming in {stateName}
          </p>
          {remaining > 0 ? (
            <button
              type="button"
              className="st-btn-violet st-event-runway-more"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              Load {Math.min(PAGE_SIZE, remaining)} more
            </button>
          ) : null}
          {visibleCount > PAGE_SIZE ? (
            <button
              type="button"
              className="st-event-runway-reset"
              onClick={() => setVisibleCount(PAGE_SIZE)}
            >
              Show fewer
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
