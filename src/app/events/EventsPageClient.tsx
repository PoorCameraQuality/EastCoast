'use client'

import EckeLink from '@/components/EckeLink'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildEventsListUrl } from '@/lib/eventsListSearchParams'
import Breadcrumb from '@/components/Breadcrumb'
import EventIndexCard from '@/components/events/EventIndexCard'
import {
  EVENT_INTENT_OPTIONS,
  intentCounts,
  matchesIntent,
  pickFeatured,
  splitUpcomingPast,
  toIndexCardModel,
  type EventsListIntent,
} from '@/lib/publicEventIndex'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type SearchEvent = {
  slug: string
  name: string
  category: string
  date: { display: string; start: string; end: string }
  location: { city: string; state: string }
  excerpt: string
  logo?: string
}

type Props = {
  indexItems: PublicEventIndexItem[]
  searchEvents: SearchEvent[]
  allDungeons: Array<{ slug: string; name: string; location: { city: string; state: string }; logo?: string }>
  allSwingClubs?: Array<{ slug: string; name: string; location: { city: string; state: string }; logo?: string }>
  selectedIntent: EventsListIntent
  locationFilter?: string
}

function matchesListSearch(item: PublicEventIndexItem, query: string): boolean {
  if (!query) return true
  const haystack = [
    item.title,
    item.city,
    item.state,
    item.regionLabel ?? '',
    item.organizerName ?? '',
    item.category,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export default function EventsPageClient({
  indexItems,
  selectedIntent,
  locationFilter,
}: Props) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchive, setShowArchive] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { upcoming: allUpcoming, past: allPast } = useMemo(
    () => splitUpcomingPast(indexItems),
    [indexItems]
  )

  const counts = useMemo(() => intentCounts(allUpcoming), [allUpcoming])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const visibleIntentOptions = useMemo(
    () =>
      EVENT_INTENT_OPTIONS.filter((opt) => {
        if (opt.id === 'all') return true
        return (counts[opt.id] ?? 0) > 0
      }),
    [counts]
  )

  const filteredUpcoming = useMemo(() => {
    let items = allUpcoming.filter((item) => matchesIntent(item, selectedIntent))
    if (locationFilter) {
      const locationQuery = locationFilter.toLowerCase()
      items = items.filter(
        (item) =>
          item.city.toLowerCase().includes(locationQuery) ||
          item.state.toLowerCase().includes(locationQuery) ||
          (item.regionLabel?.toLowerCase().includes(locationQuery) ?? false)
      )
    }
    if (normalizedQuery) {
      items = items.filter((item) => matchesListSearch(item, normalizedQuery))
    }
    return items
  }, [allUpcoming, selectedIntent, locationFilter, normalizedQuery])

  const filteredPast = useMemo(() => {
    let items = allPast.filter((item) => matchesIntent(item, selectedIntent))
    if (locationFilter) {
      const locationQuery = locationFilter.toLowerCase()
      items = items.filter(
        (item) =>
          item.city.toLowerCase().includes(locationQuery) ||
          item.state.toLowerCase().includes(locationQuery) ||
          (item.regionLabel?.toLowerCase().includes(locationQuery) ?? false)
      )
    }
    if (normalizedQuery) {
      items = items.filter((item) => matchesListSearch(item, normalizedQuery))
    }
    return items
  }, [allPast, selectedIntent, locationFilter, normalizedQuery])

  const featured = useMemo(() => {
    if (selectedIntent !== 'all' || locationFilter || normalizedQuery) return []
    return pickFeatured(filteredUpcoming, 4).map(toIndexCardModel)
  }, [filteredUpcoming, selectedIntent, locationFilter, normalizedQuery])

  const featuredSlugs = useMemo(() => new Set(featured.map((item) => item.slug)), [featured])

  const listing = useMemo(
    () =>
      filteredUpcoming
        .filter((item) => !featuredSlugs.has(item.slug))
        .map(toIndexCardModel),
    [filteredUpcoming, featuredSlugs]
  )

  const pastCards = useMemo(() => filteredPast.map(toIndexCardModel), [filteredPast])

  const applyIntent = (intent: EventsListIntent) => {
    router.replace(buildEventsListUrl(intent, locationFilter))
  }

  const intentLabel =
    EVENT_INTENT_OPTIONS.find((option) => option.id === selectedIntent)?.label ?? 'All'
  const filterLabel = locationFilter ?? intentLabel

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events', current: true },
  ]

  const resultCountLabel = (() => {
    const count = filteredUpcoming.length
    const noun = count === 1 ? 'event' : 'events'
    let label = `Showing ${count} ${noun}`
    if (normalizedQuery) label += ` for “${searchQuery.trim()}”`
    if (selectedIntent !== 'all' || locationFilter) label += ` in ${filterLabel}`
    return label
  })()

  return (
    <div className="events-index-page ecke-storefront">
      <div className="events-sticky-filter-mobile md:hidden">
        <button
          type="button"
          className="events-sticky-filter-toggle"
          onClick={() => setMobileFiltersOpen((open) => !open)}
          aria-expanded={mobileFiltersOpen}
        >
          Filter
          {selectedIntent !== 'all' || locationFilter ? (
            <span className="events-sticky-filter-badge">{filterLabel}</span>
          ) : null}
        </button>
        {mobileFiltersOpen ? (
          <div className="events-sticky-filter-drawer">
            <label className="sr-only" htmlFor="events-intent-select-sticky">
              Filter by category
            </label>
            <select
              id="events-intent-select-sticky"
              className="events-intent-select"
              value={selectedIntent}
              onChange={(event) => applyIntent(event.target.value as EventsListIntent)}
            >
              {visibleIntentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                  {option.id !== 'all' && counts[option.id] ? ` (${counts[option.id]})` : ''}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="events-list-search-sticky">
              Search events
            </label>
            <input
              id="events-list-search-sticky"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search events…"
              className="events-list-search-input"
              aria-label="Search events"
            />
          </div>
        ) : null}
      </div>

      <div className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="events-index-hero">
            <p className="events-index-kicker">Public event marketplace</p>
            <h1 className="events-index-title">Events &amp; conventions</h1>
            <p className="events-index-subhead">
              Find what is happening next: hotel weekends, classes, parties, vendor markets, outdoor
              events, and community gatherings.
            </p>

            <div className="events-filter-controls">
              <div className="events-intent-rail hidden md:flex" role="toolbar" aria-label="Filter events by intent">
                {visibleIntentOptions.map((option) => {
                  const isActive = selectedIntent === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applyIntent(option.id)}
                      className={`events-intent-tab ${isActive ? 'events-intent-tab-active' : ''}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {option.label}
                      {option.id !== 'all' && counts[option.id] ? (
                        <span className="events-intent-count">{counts[option.id]}</span>
                      ) : option.id === 'all' ? (
                        <span className="events-intent-count">{allUpcoming.length}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <div className="events-mobile-filter-row md:hidden">
                <label className="sr-only" htmlFor="events-intent-select">
                  Filter by category
                </label>
                <select
                  id="events-intent-select"
                  className="events-intent-select"
                  value={selectedIntent}
                  onChange={(event) => applyIntent(event.target.value as EventsListIntent)}
                >
                  {visibleIntentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                      {option.id !== 'all' && counts[option.id] ? ` (${counts[option.id]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <label className="sr-only" htmlFor="events-list-search">
                Search events by name or location
              </label>
              <input
                id="events-list-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search events by name or location…"
                className="events-list-search-input"
                aria-label="Search events by name or location"
              />

              <p className="events-result-count" aria-live="polite">
                {resultCountLabel}
              </p>
            </div>
          </header>

          {featured.length > 0 ? (
            <section className="events-featured-section" aria-labelledby="events-featured-title">
              <div className="events-section-header">
                <div>
                  <h2 id="events-featured-title" className="events-section-title">
                    Featured weekends
                  </h2>
                  <p className="events-section-note">
                    Larger multi-day conventions worth planning around
                  </p>
                </div>
              </div>
              <div className="events-featured-grid">
                {featured.map((item, index) => (
                  <EventIndexCard
                    key={item.slug}
                    item={item}
                    variant="featured"
                    itemListName="events_featured_runway"
                    priority={index < 2}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {listing.length > 0 ? (
            <section aria-labelledby="events-upcoming-title">
              <div className="events-section-header">
                <div>
                  <h2 id="events-upcoming-title" className="events-section-title">
                    Upcoming
                  </h2>
                  <p className="events-section-meta">
                    {filterLabel} · {listing.length} listing{listing.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="events-upcoming-list">
                {listing.map((item, index) => (
                  <EventIndexCard
                    key={item.slug}
                    item={item}
                    variant="upcoming"
                    itemListName="events_page_upcoming"
                    priority={index < 3}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {listing.length === 0 && featured.length === 0 ? (
            <div className="events-empty-panel">
              <h3 className="events-empty-title">Nothing in this view</h3>
              <p className="events-empty-body">
                Try a different filter or clear your search.
              </p>
              <div className="events-empty-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    applyIntent('all')
                  }}
                  className="sf-btn-primary min-h-11"
                >
                  Browse all events
                </button>
                <EckeLink href="/calendar" className="sf-btn-ghost min-h-11">
                  Open calendar
                </EckeLink>
              </div>
            </div>
          ) : null}

          {pastCards.length > 0 ? (
            <section className="events-past-section" aria-labelledby="events-archive-toggle">
              <button
                id="events-archive-toggle"
                type="button"
                className="events-archive-toggle"
                aria-expanded={showArchive}
                onClick={() => setShowArchive((open) => !open)}
              >
                {showArchive
                  ? `− Hide archived events (${pastCards.length})`
                  : `+ Show archived events (${pastCards.length})`}
              </button>
              {showArchive ? (
                <div className="events-past-list">
                  {pastCards.map((item) => (
                    <EventIndexCard
                      key={item.slug}
                      item={item}
                      variant="past"
                      itemListName="events_page_past"
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
