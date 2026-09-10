'use client'

import { useMemo, useState } from 'react'
import CalendarMonthGrid from '@/components/calendar/CalendarMonthGrid'
import { monthGridDays, parseLocalDate, startOfToday } from '@/lib/calendarVisual'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type Props = {
  placeName: string
  events: PublicEventIndexItem[]
}

export default function PlaceEventCalendar({ placeName, events }: Props) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const days = useMemo(() => monthGridDays(currentYear, currentMonth), [currentYear, currentMonth])

  const monthBounds = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1)
    const end = new Date(currentYear, currentMonth + 1, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [currentYear, currentMonth])

  const monthItems = useMemo(
    () =>
      events.filter((item) => {
        const start = parseLocalDate(item.startsAt)
        const end = parseLocalDate(item.endsAt)
        return start <= monthBounds.end && end >= monthBounds.start
      }),
    [events, monthBounds],
  )

  const upcoming = useMemo(() => {
    const today = startOfToday()
    return events
      .filter((item) => parseLocalDate(item.endsAt) >= today)
      .sort((a, b) => parseLocalDate(a.startsAt).getTime() - parseLocalDate(b.startsAt).getTime())
  }, [events])

  return (
    <div className="place-event-calendar">
      <div className="cal-nav">
        <button
          type="button"
          onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
          className="cal-icon-btn"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="cal-month-label">{monthTitle}</h3>
        <button
          type="button"
          onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
          className="cal-icon-btn"
          aria-label="Next month"
        >
          ›
        </button>
        <button type="button" onClick={() => setCurrentDate(new Date())} className="cal-today-btn">
          Today
        </button>
      </div>
      <CalendarMonthGrid
        days={days}
        currentMonth={currentMonth}
        items={monthItems}
        weekdayLabels="short"
      />
      {monthItems.length === 0 ? (
        <p className="mt-3 text-sm text-sf-muted">
          {upcoming.length
            ? `No nights at ${placeName} this month.`
            : `No public nights listed at ${placeName} yet.`}
        </p>
      ) : null}
    </div>
  )
}
