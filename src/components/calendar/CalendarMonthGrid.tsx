'use client'

import EckeLink from '@/components/EckeLink'
import {
  calendarPillTone,
  eventOnDate,
  isPastItem,
  isTodayDate,
  parseLocalDate,
  spanRoleForDate,
} from '@/lib/calendarVisual'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type Props = {
  days: Date[]
  currentMonth: number
  items: PublicEventIndexItem[]
}

function isPastDay(date: Date, currentMonth: number): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d < today && date.getMonth() === currentMonth
}

export default function CalendarMonthGrid({ days, currentMonth, items }: Props) {
  const getEventsForDate = (date: Date) =>
    items
      .filter((item) => eventOnDate(item, date))
      .sort((a, b) => {
        const spanA = parseLocalDate(a.endsAt).getTime() - parseLocalDate(a.startsAt).getTime()
        const spanB = parseLocalDate(b.endsAt).getTime() - parseLocalDate(b.startsAt).getTime()
        return spanB - spanA || a.title.localeCompare(b.title)
      })

  return (
    <div className="cal-month-grid-wrap">
      <div className="cal-month-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="cal-month-grid-head">
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date)
          const isCurrentMonth = date.getMonth() === currentMonth
          const pastDay = isPastDay(date, currentMonth)
          const today = isTodayDate(date)
          const visible = dayEvents.slice(0, 3)
          const more = dayEvents.length - visible.length

          return (
            <div
              key={index}
              className={`cal-month-cell ${!isCurrentMonth ? 'cal-month-cell-outside' : ''} ${
                pastDay ? 'cal-month-cell-past' : ''
              }`}
            >
              <div className="cal-month-cell-head">
                <span className={`cal-month-day ${today ? 'cal-month-day-today' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
              <div className="cal-month-pills">
                {visible.map((item) => {
                  const past = isPastItem(item)
                  const role = spanRoleForDate(item, date)
                  const tone = calendarPillTone(item, past)
                  return (
                    <EckeLink
                      key={`${item.slug}-${date.toISOString()}`}
                      href={`/events/${item.slug}`}
                      className={`cal-pill ${tone.bar} cal-pill--${role} ${past ? 'cal-pill-past' : ''}`}
                      title={`${item.title} — ${item.city}, ${item.state}`}
                    >
                      <span className="cal-pill-label">{item.title}</span>
                      {item.dancecardEnabled ? (
                        <span className="cal-pill-dancecard" aria-label="Dancecard enabled" />
                      ) : null}
                      {item.sourceSystem === 'kink_social' ? (
                        <span className="cal-pill-sync" aria-label="Published from kink.social" />
                      ) : null}
                    </EckeLink>
                  )
                })}
                {more > 0 ? <span className="cal-month-more">+{more} more</span> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarLegend() {
  return (
    <div className="cal-legend">
      <h3 className="cal-legend-title">Event types</h3>
      <ul className="cal-legend-list">
        <li><span className="cal-legend-swatch cal-tone-convention" /> Convention / hotel weekend</li>
        <li><span className="cal-legend-swatch cal-tone-outdoor" /> Outdoor / campout</li>
        <li><span className="cal-legend-swatch cal-tone-class" /> Class / workshop</li>
        <li><span className="cal-legend-swatch cal-tone-party" /> Party / social</li>
        <li><span className="cal-legend-swatch cal-tone-vendor" /> Vendor market</li>
        <li><span className="cal-legend-swatch cal-tone-past" /> Past</li>
        <li><span className="cal-legend-dot cal-pill-dancecard" /> Dancecard</li>
        <li><span className="cal-legend-dot cal-pill-sync" /> From kink.social</li>
      </ul>
    </div>
  )
}
