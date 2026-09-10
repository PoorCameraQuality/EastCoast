'use client'

import EckeLink from '@/components/EckeLink'
import { exportSingleEvent } from '@/lib/calendarExport'
import { calendarPillTone, isPastItem, parseLocalDate, typeBadgeLabel } from '@/lib/calendarVisual'
import { sourceLabel } from '@/lib/publicEventIndex'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type Props = {
  item: PublicEventIndexItem
}

export default function CalendarEventRow({ item }: Props) {
  const past = isPastItem(item)
  const start = parseLocalDate(item.startsAt)
  const tone = calendarPillTone(item, past)
  const src = sourceLabel(item)

  return (
    <article className={`cal-event-row ${past ? 'cal-event-row-past' : ''}`}>
      <div className="cal-event-row-date" aria-hidden>
        <span className="cal-event-row-date-month">
          {start.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="cal-event-row-date-day">{start.getDate()}</span>
      </div>

      {item.logoUrl ? (
        <div className="cal-event-row-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.logoUrl} alt="" loading="lazy" />
        </div>
      ) : (
        <div className="cal-event-row-thumb cal-event-row-thumb-fallback" aria-hidden>
          {item.title.slice(0, 1)}
        </div>
      )}

      <div className="cal-event-row-body">
        <div className="cal-event-row-badges">
          <span className={`cal-badge ${tone.pill}`}>{typeBadgeLabel(item)}</span>
          {item.dancecardEnabled ? <span className="cal-badge cal-badge-dancecard">Dancecard</span> : null}
          {src ? (
            <span className="cal-badge cal-badge-source" title={src}>
              <span className="cal-source-dot" aria-hidden />
              {src}
            </span>
          ) : null}
        </div>
        <EckeLink href={`/events/${item.slug}`} className="cal-event-row-title">
          {item.title}
        </EckeLink>
        <p className="cal-event-row-meta">
          {item.dateDisplay}
          <span className="cal-event-row-sep"> · </span>
          {item.city}, {item.state}
        </p>
        <div className="cal-event-row-actions">
          <EckeLink href={`/events/${item.slug}`} className="cal-btn cal-btn-view">
            View event
          </EckeLink>
          <details className="cal-event-row-more">
            <summary>Add to calendar</summary>
            <div className="cal-event-row-export">
              <button type="button" onClick={() => exportSingleEvent(item, 'google')}>
                Google
              </button>
              <button type="button" onClick={() => exportSingleEvent(item, 'apple')}>
                Apple
              </button>
              <button type="button" onClick={() => exportSingleEvent(item, 'ical')}>
                iCal
              </button>
            </div>
          </details>
        </div>
      </div>
    </article>
  )
}

export function CalendarPlanningCtaCompact({ showDancecardNote }: { showDancecardNote?: boolean }) {
  return (
    <aside className="cal-planning-cta" aria-label="Plan your weekend">
      <h2 className="cal-planning-cta-title">Make this calendar yours.</h2>
      <p className="cal-planning-cta-body">
        Browse by month, filter by type or region, and export dates to your own calendar.
      </p>
      {showDancecardNote ? (
        <p className="cal-planning-cta-note">Dancecard available for supported events.</p>
      ) : null}
      <div className="cal-planning-cta-actions">
        <EckeLink href="/events" className="sf-btn-rose cal-planning-btn">
          Browse events
        </EckeLink>
        <EckeLink href="/contact" className="sf-btn-primary cal-planning-btn">
          List an event
        </EckeLink>
      </div>
    </aside>
  )
}
