'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface CalendarEvent {
  slug: string
  name: string
  date: {
    start: string
    end: string
    display: string
  }
  category: string
  location: {
    city: string
    state: string
  }
}

interface CalendarClientProps {
  allEvents: CalendarEvent[]
}

function getCategoryStyles(category: string, isPast: boolean): { bar: string; pill: string } {
  if (isPast) {
    return { bar: 'bg-gray-600', pill: 'bg-gray-600/25 text-gray-300' }
  }
  switch (category) {
    case 'Outdoor Event':
      return { bar: 'bg-emerald-600', pill: 'bg-emerald-600/20 text-emerald-200' }
    case 'Indoor Event':
      return { bar: 'bg-primary-600', pill: 'bg-primary-600/25 text-primary-200' }
    case 'Conference':
    case 'Convention':
      return { bar: 'bg-violet-600', pill: 'bg-violet-600/25 text-violet-200' }
    case 'Workshop':
    case 'Party':
      return { bar: 'bg-amber-600', pill: 'bg-amber-600/25 text-amber-100' }
    case 'Weekend Event':
    case 'Retreat':
    case 'Contest Weekend':
      return { bar: 'bg-teal-600', pill: 'bg-teal-600/25 text-teal-200' }
    default:
      return { bar: 'bg-slate-500', pill: 'bg-slate-500/25 text-slate-200' }
  }
}

export default function CalendarClient({ allEvents }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: Date[] = []
    const dateIterator = new Date(startDate)

    while (dateIterator <= lastDay || dateIterator.getDay() !== 0) {
      days.push(new Date(dateIterator))
      dateIterator.setDate(dateIterator.getDate() + 1)
    }

    return days
  }, [currentYear, currentMonth])

  const monthEvents = useMemo(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    return allEvents.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      return eventStart <= endOfMonth && eventEnd >= startOfMonth
    })
  }, [allEvents, currentYear, currentMonth])

  const sortedMonthEvents = useMemo(() => {
    return [...monthEvents].sort(
      (a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()
    )
  }, [monthEvents])

  const getEventsForDate = (date: Date) => {
    return monthEvents.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      const checkDate = new Date(date)
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastEvent = (event: CalendarEvent) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(event.date.end) < today
  }

  const goToPreviousMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const exportToGoogleCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`${event.name} - ${event.date.display}\nLocation: ${event.location.city}, ${event.location.state}\n\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`)}&location=${encodeURIComponent(`${event.location.city}, ${event.location.state}`)}`
    window.open(googleCalendarUrl, '_blank')
  }

  const exportToICal = (event: CalendarEvent) => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    const formatDateForICal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.slug}@eastcoastkinkevents.com`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
      `LOCATION:${event.location.city}, ${event.location.state}`,
      `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.slug}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportMonthToGoogleCalendar = () => {
    if (monthEvents.length === 0) return
    const startDate = new Date(currentYear, currentMonth, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 0)
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const eventList = monthEvents
      .map((e) => `${e.name} - ${e.date.display} (${e.location.city}, ${e.location.state})`)
      .join('\n')
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`East Coast Kink Events - ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Events for ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:\n\n${eventList}\n\nView all events: https://www.eastcoastkinkevents.com/calendar`)}`
    window.open(googleCalendarUrl, '_blank')
  }

  const exportMonthToICal = () => {
    if (monthEvents.length === 0) return
    const startDate = new Date(currentYear, currentMonth, 1)
    const formatDateForICal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN',
    ]
    monthEvents.forEach((event) => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.slug}@eastcoastkinkevents.com`,
        `DTSTART:${formatDateForICal(eventStart)}`,
        `DTEND:${formatDateForICal(eventEnd)}`,
        `SUMMARY:${event.name}`,
        `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
        `LOCATION:${event.location.city}, ${event.location.state}`,
        `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
        'END:VEVENT'
      )
    })
    icalContent.push('END:VCALENDAR')
    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `east-coast-kink-events-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const addToAppleCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    const formatDateForICal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.slug}@eastcoastkinkevents.com`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
      `LOCATION:${event.location.city}, ${event.location.state}`,
      `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icalContent)}`
    if (
      navigator.userAgent.includes('Mac') ||
      navigator.userAgent.includes('iPhone') ||
      navigator.userAgent.includes('iPad')
    ) {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${event.slug}.ics`
      link.click()
    } else {
      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${event.slug}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const addMonthToAppleCalendar = () => {
    if (monthEvents.length === 0) return
    const startDate = new Date(currentYear, currentMonth, 1)
    const formatDateForICal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN',
    ]
    monthEvents.forEach((event) => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.slug}@eastcoastkinkevents.com`,
        `DTSTART:${formatDateForICal(eventStart)}`,
        `DTEND:${formatDateForICal(eventEnd)}`,
        `SUMMARY:${event.name}`,
        `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
        `LOCATION:${event.location.city}, ${event.location.state}`,
        `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
        'END:VEVENT'
      )
    })
    icalContent.push('END:VCALENDAR')
    const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icalContent.join('\r\n'))}`
    if (
      navigator.userAgent.includes('Mac') ||
      navigator.userAgent.includes('iPhone') ||
      navigator.userAgent.includes('iPad')
    ) {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `east-coast-kink-events-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.ics`
      link.click()
    } else {
      const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `east-coast-kink-events-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const outdoorCount = monthEvents.filter((e) => e.category === 'Outdoor Event').length
  const nonOutdoorCount = monthEvents.length - outdoorCount

  const exportDisabled = monthEvents.length === 0
  const exportBtnClass =
    'inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:py-2.5'

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 text-center md:mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">Plan ahead</p>
        <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          BDSM &amp; kink event calendar
        </h1>
        <p className="mx-auto mt-4 max-w-2xl px-1 text-base leading-relaxed text-gray-400 md:text-lg">
          Conferences, hotel weekends, and workshops by month. On phones, use the{' '}
          <strong className="font-medium text-gray-200">list below</strong>; on larger screens the month grid is a
          quick visual map.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
          Prefer filters?{' '}
          <Link href="/events" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
            All events
          </Link>{' '}
          ·{' '}
          <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
            By state
          </Link>
        </p>
      </div>

      {/* Month toolbar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 md:p-5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
            aria-label="Previous month"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="min-w-0 flex-1 text-center font-serif text-xl font-bold text-white sm:flex-none sm:px-3 sm:text-left sm:text-2xl">
            {monthTitle}
          </h2>
          <button
            type="button"
            onClick={goToNextMonth}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
            aria-label="Next month"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="min-h-touch rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-500"
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <span className="hidden text-sm text-gray-500 md:inline">Month export:</span>
          <details className="w-full min-w-0 sm:w-auto md:hidden">
            <summary className="min-h-touch cursor-pointer list-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              Export this month…
            </summary>
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => exportMonthToGoogleCalendar()}
                disabled={exportDisabled}
                className={`${exportBtnClass} bg-gradient-to-r from-primary-500 to-primary-600 text-white`}
              >
                Google Calendar
              </button>
              <button
                type="button"
                onClick={() => exportMonthToICal()}
                disabled={exportDisabled}
                className={`${exportBtnClass} bg-emerald-700 text-white hover:bg-emerald-600`}
              >
                Download .ics (Apple, Outlook, etc.)
              </button>
            </div>
          </details>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={exportMonthToGoogleCalendar}
              disabled={exportDisabled}
              className={`${exportBtnClass} bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:from-primary-600 hover:to-primary-700`}
              title="Add all month events to Google Calendar"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={addMonthToAppleCalendar}
              disabled={exportDisabled}
              className={`${exportBtnClass} border border-white/20 bg-white/10 text-white hover:bg-white/15`}
              title="Open or download month .ics"
            >
              Apple
            </button>
            <button
              type="button"
              onClick={exportMonthToICal}
              disabled={exportDisabled}
              className={`${exportBtnClass} bg-emerald-700 text-white hover:bg-emerald-600`}
              title="Download .ics"
            >
              iCal
            </button>
          </div>
        </div>
      </div>

      {/* Inline stats */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 md:justify-start">
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
          <span className="font-semibold tabular-nums text-white">{monthEvents.length}</span> this month
        </div>
        <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200/90">
          <span className="font-semibold tabular-nums">{outdoorCount}</span> outdoor
        </div>
        <div className="rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2 text-sm text-primary-200/90">
          <span className="font-semibold tabular-nums">{nonOutdoorCount}</span> indoor &amp; other
        </div>
      </div>

      {/* Mobile-first: chronological list */}
      <section id="this-month-list" className="mb-10 md:mb-12" aria-labelledby="list-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 id="list-heading" className="font-serif text-xl font-semibold text-white md:text-2xl">
            This month · all events
          </h2>
          <Link
            href="#month-grid"
            className="hidden text-sm text-primary-400 underline underline-offset-2 hover:text-primary-300 md:inline"
          >
            Jump to grid
          </Link>
        </div>
        {sortedMonthEvents.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-gray-400">
            No listings overlap this month. Try another month or browse{' '}
            <Link href="/events" className="text-primary-400 underline">
              all events
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3 list-none p-0">
            {sortedMonthEvents.map((event) => {
              const start = new Date(event.date.start)
              const past = isPastEvent(event)
              const { pill } = getCategoryStyles(event.category, past)
              return (
                <li key={event.slug}>
                  <article
                    className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 transition hover:border-primary-500/30 sm:p-5 ${past ? 'opacity-70' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-black/40 py-2 text-center ring-1 ring-white/10 sm:w-16">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-primary-300/90">
                          {start.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold tabular-nums text-white sm:text-2xl">
                          {start.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/events/${event.slug}`}
                          className="text-base font-semibold text-white hover:text-primary-300 sm:text-lg"
                        >
                          {event.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-400">
                          {event.location.city}, {event.location.state}
                          <span className="text-gray-600"> · </span>
                          {event.date.display}
                        </p>
                        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${pill}`}>
                          {event.category}
                        </span>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                          <span className="text-xs text-gray-500">Add to calendar:</span>
                          <button
                            type="button"
                            onClick={() => exportToGoogleCalendar(event)}
                            className="rounded-lg bg-primary-600/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-500"
                          >
                            Google
                          </button>
                          <button
                            type="button"
                            onClick={() => addToAppleCalendar(event)}
                            className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/15"
                           >
                            Apple / .ics
                          </button>
                          <button
                            type="button"
                            onClick={() => exportToICal(event)}
                            className="rounded-lg bg-emerald-800/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Desktop month grid — no horizontal scroll, compact cells */}
      <section id="month-grid" className="mb-10 hidden md:block" aria-label={`Calendar grid for ${monthTitle}`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Month view</h2>
          <Link
            href="#this-month-list"
            className="text-sm text-primary-400 underline underline-offset-2 hover:text-primary-300"
          >
            Back to list
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <div className="grid grid-cols-7 gap-px bg-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-dark-900 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                {day}
              </div>
            ))}
            {calendarData.map((date, index) => {
              const events = getEventsForDate(date)
              const isCurrentMonth = date.getMonth() === currentMonth
              const past = isPastDate(date)
              const todayD = isToday(date)
              const show = events.slice(0, 2)
              const more = events.length - show.length

              return (
                <div
                  key={index}
                  className={`min-h-[7rem] bg-dark-900 p-1.5 lg:min-h-[8.5rem] lg:p-2 ${past ? 'opacity-55' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <div className="mb-1 flex justify-between">
                    <span
                      className={`flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg text-xs font-semibold ${
                        todayD
                          ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/40'
                          : isCurrentMonth
                            ? 'text-gray-200'
                            : 'text-gray-600'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {show.map((event, eventIndex) => {
                      const pastEv = isPastEvent(event)
                      const { bar } = getCategoryStyles(event.category, pastEv)
                      return (
                        <Link
                          key={`${event.slug}-${eventIndex}`}
                          href={`/events/${event.slug}`}
                          className={`block truncate rounded-md border border-white/5 px-1.5 py-1 text-[10px] leading-tight text-white ring-1 ring-inset ring-white/5 transition hover:ring-primary-500/40 lg:text-[11px] ${bar} ${pastEv ? 'opacity-60' : ''}`}
                          title={`${event.name} — ${event.location.city}, ${event.location.state}`}
                        >
                          <span className="line-clamp-2 font-medium">{event.name}</span>
                        </Link>
                      )
                    })}
                    {more > 0 ? (
                      <Link
                        href="#this-month-list"
                        className="text-[10px] font-medium text-primary-400 hover:text-primary-300 lg:text-xs"
                      >
                        +{more} more →
                      </Link>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h3 className="font-serif text-lg font-semibold text-white">Legend</h3>
          <p className="mt-1 text-sm text-gray-500">Colors in the month grid match event type.</p>
          <ul className="mt-4 flex list-none flex-col gap-3 p-0 text-sm">
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-emerald-600" aria-hidden />
              <span className="text-gray-300">Outdoor</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-primary-600" aria-hidden />
              <span className="text-gray-300">Indoor</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-violet-600" aria-hidden />
              <span className="text-gray-300">Conference / convention</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-teal-600" aria-hidden />
              <span className="text-gray-300">Weekend / retreat / contest</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-gray-600" aria-hidden />
              <span className="text-gray-300">Past</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-600 text-[10px] font-bold text-white" aria-hidden>
                6
              </span>
              <span className="text-gray-300">Today (highlighted day number)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
