'use client'

import { useMemo, useState } from 'react'
import EckeLink from '@/components/EckeLink'
import CalendarEventRow, { CalendarPlanningCtaCompact } from '@/components/calendar/CalendarEventRow'
import CalendarMonthGrid, { CalendarLegend } from '@/components/calendar/CalendarMonthGrid'
import CalendarSponsorCard from '@/components/calendar/CalendarSponsorCard'
import {
  exportEventsToApple,
  exportEventsToGoogle,
  exportEventsToIcal,
} from '@/lib/calendarExport'
import { activeStates, groupByWeek, parseLocalDate } from '@/lib/calendarVisual'
import {
  EVENT_INTENT_OPTIONS,
  intentCounts,
  matchesIntent,
  pickFeatured,
  type EventsListIntent,
} from '@/lib/publicEventIndex'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type ViewMode = 'list' | 'month'

type Props = {
  indexItems: PublicEventIndexItem[]
}

export default function CalendarPageClient({ indexItems }: Props) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<ViewMode>('list')
  const [intent, setIntent] = useState<EventsListIntent>('all')
  const [stateFilter, setStateFilter] = useState<string>('')

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    const days: Date[] = []
    const cursor = new Date(startDate)
    while (cursor <= lastDay || cursor.getDay() !== 0) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return days
  }, [currentYear, currentMonth])

  const monthBounds = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1)
    const end = new Date(currentYear, currentMonth + 1, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [currentYear, currentMonth])

  const upcomingAll = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return indexItems
      .filter((i) => parseLocalDate(i.endsAt) >= today)
      .sort((a, b) => parseLocalDate(a.startsAt).getTime() - parseLocalDate(b.startsAt).getTime())
  }, [indexItems])

  const intentOptions = useMemo(() => {
    const counts = intentCounts(upcomingAll)
    return EVENT_INTENT_OPTIONS.filter((opt) => opt.id === 'all' || (counts[opt.id] ?? 0) > 0)
  }, [upcomingAll])

  const states = useMemo(() => activeStates(upcomingAll), [upcomingAll])

  const filteredItems = useMemo(() => {
    let items = upcomingAll.filter((i) => matchesIntent(i, intent))
    if (stateFilter) {
      items = items.filter((i) => i.state === stateFilter)
    }
    return items
  }, [upcomingAll, intent, stateFilter])

  const monthItems = useMemo(() => {
    return filteredItems.filter((item) => {
      const start = parseLocalDate(item.startsAt)
      const end = parseLocalDate(item.endsAt)
      return start <= monthBounds.end && end >= monthBounds.start
    })
  }, [filteredItems, monthBounds])

  const weekGroups = useMemo(() => groupByWeek(monthItems), [monthItems])

  const featuredWeekend = useMemo(() => {
    const featured = pickFeatured(monthItems, 1)[0]
    return featured ?? null
  }, [monthItems])

  const showDancecardNote = useMemo(
    () => monthItems.some((i) => i.dancecardEnabled),
    [monthItems]
  )

  const exportDisabled = filteredItems.length === 0
  const exportLabel = stateFilter
    ? `${stateFilter} · ${monthTitle}`
    : intent !== 'all'
      ? `${EVENT_INTENT_OPTIONS.find((o) => o.id === intent)?.label ?? 'Filtered'} · ${monthTitle}`
      : monthTitle

  const goToPreviousMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const exportGoogle = () =>
    exportEventsToGoogle(monthItems, `East Coast Kink Events — ${exportLabel}`)
  const exportApple = () =>
    exportEventsToApple(
      monthItems,
      `east-coast-kink-events-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.ics`
    )
  const exportIcal = () =>
    exportEventsToIcal(
      monthItems,
      `east-coast-kink-events-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}.ics`
    )

  const clearFilters = () => {
    setIntent('all')
    setStateFilter('')
  }

  return (
    <div className="cal-page">
      <header className="cal-header">
        <p className="cal-kicker">Planning</p>
        <h1 className="cal-title">Calendar</h1>
        <p className="cal-subhead">
          Plan around upcoming kink events, conventions, classes, vendor markets, and community weekends.
        </p>
        <p className="cal-support">
          Browse by month, filter by event type or region, and save what matters on kink.social.
        </p>
      </header>

      <div className="cal-control-bar">
        <div className="cal-nav">
          <button type="button" onClick={goToPreviousMonth} className="cal-icon-btn" aria-label="Previous month">
            ‹
          </button>
          <h2 className="cal-month-label">{monthTitle}</h2>
          <button type="button" onClick={goToNextMonth} className="cal-icon-btn" aria-label="Next month">
            ›
          </button>
          <button type="button" onClick={goToToday} className="cal-today-btn">
            Today
          </button>
        </div>

        <div className="cal-view-toggle" role="group" aria-label="Calendar view">
          <button
            type="button"
            className={view === 'list' ? 'cal-view-btn cal-view-btn-active' : 'cal-view-btn'}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            type="button"
            className={view === 'month' ? 'cal-view-btn cal-view-btn-active' : 'cal-view-btn'}
            onClick={() => setView('month')}
          >
            Month
          </button>
        </div>

        <div className="cal-export">
          <span className="cal-export-label">Export this view</span>
          <div className="cal-export-actions">
            <button type="button" disabled={exportDisabled} onClick={exportGoogle} className="cal-export-btn">
              Google
            </button>
            <button type="button" disabled={exportDisabled} onClick={exportApple} className="cal-export-btn">
              Apple
            </button>
            <button type="button" disabled={exportDisabled} onClick={exportIcal} className="cal-export-btn">
              iCal
            </button>
          </div>
          <p className="cal-export-hint">Subscribe to this calendar — keep public listings in your own calendar app.</p>
        </div>
      </div>

      <div className="cal-filters">
        <div className="cal-intent-rail" role="toolbar" aria-label="Event type filters">
          {intentOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={intent === opt.id ? 'cal-filter-pill cal-filter-pill-active' : 'cal-filter-pill'}
              onClick={() => setIntent(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {states.length > 0 ? (
          <div className="cal-state-rail" role="toolbar" aria-label="Region filters">
            <button
              type="button"
              className={!stateFilter ? 'cal-filter-pill cal-filter-pill-active' : 'cal-filter-pill'}
              onClick={() => setStateFilter('')}
            >
              All states
            </button>
            {states.map((st) => (
              <button
                key={st}
                type="button"
                className={stateFilter === st ? 'cal-filter-pill cal-filter-pill-active' : 'cal-filter-pill'}
                onClick={() => setStateFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="cal-layout">
        <div className="cal-main">
          {monthItems.length === 0 ? (
            <div className="cal-empty">
              <p className="cal-empty-title">No events found for this view.</p>
              <div className="cal-empty-actions">
                <button type="button" onClick={clearFilters} className="cal-btn cal-btn-view">
                  Remove filters
                </button>
                <EckeLink href="/events" className="cal-btn cal-btn-view">
                  Browse all events
                </EckeLink>
                <EckeLink href="/states" className="cal-btn cal-btn-view">
                  Check nearby states
                </EckeLink>
              </div>
            </div>
          ) : view === 'month' ? (
            <>
              <CalendarMonthGrid days={calendarDays} currentMonth={currentMonth} items={monthItems} />
              <CalendarLegend />
            </>
          ) : (
            <div className="cal-list">
              {weekGroups.map((group) => (
                <section key={group.label} className="cal-list-week" aria-label={group.label}>
                  <h3 className="cal-list-week-label">{group.label}</h3>
                  <ul className="cal-list-items">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <CalendarEventRow item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <div className="cal-mobile-cta lg:hidden">
            <CalendarPlanningCtaCompact showDancecardNote={showDancecardNote} />
          </div>

          <div className="cal-footer-sponsor lg:hidden">
            <CalendarSponsorCard />
          </div>
        </div>

        <aside className="cal-rail" aria-label="Planning sidebar">
          <div className="cal-rail-card">
            <h3 className="cal-rail-title">This month</h3>
            <p className="cal-rail-stat">
              <strong>{monthItems.length}</strong> event{monthItems.length === 1 ? '' : 's'}
              {stateFilter ? ` in ${stateFilter}` : ''}
            </p>
          </div>

          {featuredWeekend ? (
            <div className="cal-rail-card">
              <h3 className="cal-rail-title">Featured weekend</h3>
              <EckeLink href={`/events/${featuredWeekend.slug}`} className="cal-rail-featured">
                <span className="cal-rail-featured-title">{featuredWeekend.title}</span>
                <span className="cal-rail-featured-meta">
                  {featuredWeekend.dateDisplay} · {featuredWeekend.city}, {featuredWeekend.state}
                </span>
              </EckeLink>
            </div>
          ) : null}

          <CalendarPlanningCtaCompact showDancecardNote={showDancecardNote} />

          <div className="cal-rail-card cal-rail-export">
            <h3 className="cal-rail-title">Export current view</h3>
            <p className="cal-rail-body">Keep filtered public listings in Google, Apple, or any iCal app.</p>
            <div className="cal-export-actions cal-export-actions-stack">
              <button type="button" disabled={exportDisabled} onClick={exportGoogle} className="cal-export-btn">
                Google Calendar
              </button>
              <button type="button" disabled={exportDisabled} onClick={exportApple} className="cal-export-btn">
                Apple Calendar
              </button>
              <button type="button" disabled={exportDisabled} onClick={exportIcal} className="cal-export-btn">
                Download iCal
              </button>
            </div>
          </div>

          <CalendarSponsorCard />
        </aside>
      </div>
    </div>
  )
}
