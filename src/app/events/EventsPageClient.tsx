'use client'

import EckeLink from '@/components/EckeLink'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildEventsListUrl,
} from '@/lib/eventsListSearchParams'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import EventIndexCard from '@/components/events/EventIndexCard'
import EventsPlanningStrip from '@/components/events/EventsPlanningStrip'
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

const PLANNING_STRIP_AFTER = 9

export default function EventsPageClient({
  indexItems,
  searchEvents,
  allDungeons,
  allSwingClubs = [],
  selectedIntent,
  locationFilter,
}: Props) {
  const router = useRouter()

  const { upcoming: allUpcoming, past: allPast } = useMemo(
    () => splitUpcomingPast(indexItems),
    [indexItems]
  )

  const counts = useMemo(() => intentCounts(allUpcoming), [allUpcoming])

  const filteredUpcoming = useMemo(() => {
    let items = allUpcoming.filter((i) => matchesIntent(i, selectedIntent))
    if (locationFilter) {
      const q = locationFilter.toLowerCase()
      items = items.filter(
        (i) =>
          i.city.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q) ||
          (i.regionLabel?.toLowerCase().includes(q) ?? false)
      )
    }
    return items
  }, [allUpcoming, selectedIntent, locationFilter])

  const filteredPast = useMemo(() => {
    let items = allPast.filter((i) => matchesIntent(i, selectedIntent))
    if (locationFilter) {
      const q = locationFilter.toLowerCase()
      items = items.filter(
        (i) =>
          i.city.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q) ||
          (i.regionLabel?.toLowerCase().includes(q) ?? false)
      )
    }
    return items
  }, [allPast, selectedIntent, locationFilter])

  const featured = useMemo(() => {
    if (selectedIntent !== 'all' || locationFilter) return []
    return pickFeatured(filteredUpcoming, 4).map(toIndexCardModel)
  }, [filteredUpcoming, selectedIntent, locationFilter])

  const featuredSlugs = useMemo(() => new Set(featured.map((f) => f.slug)), [featured])

  const listing = useMemo(
    () =>
      filteredUpcoming
        .filter((i) => !featuredSlugs.has(i.slug))
        .map(toIndexCardModel),
    [filteredUpcoming, featuredSlugs]
  )

  const pastCards = useMemo(() => filteredPast.map(toIndexCardModel), [filteredPast])

  const applyIntent = (intent: EventsListIntent) => {
    router.replace(buildEventsListUrl(intent, locationFilter))
  }

  const filterLabel =
    locationFilter ??
    EVENT_INTENT_OPTIONS.find((o) => o.id === selectedIntent)?.label ??
    'All'

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events', current: true },
  ]

  const beforeStrip = listing.slice(0, PLANNING_STRIP_AFTER)
  const afterStrip = listing.slice(PLANNING_STRIP_AFTER)

  return (
    <div className="events-index-page ecke-storefront">
      <div className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="events-index-hero">
            <p className="events-index-kicker">Public event marketplace</p>
            <h1 className="events-index-title">Events &amp; conventions</h1>
            <p className="events-index-subhead">
              Find what is happening next: hotel weekends, classes, parties, vendor markets, outdoor events,
              and community gatherings.
            </p>
            <div className="events-index-search storefront-search">
              <Search
                compact
                events={searchEvents}
                dungeons={allDungeons}
                swingClubs={allSwingClubs}
                placeholder="Search by event, city, state, organizer, venue, or topic"
              />
            </div>

            <div className="events-intent-rail" role="toolbar" aria-label="Filter events by intent">
              {EVENT_INTENT_OPTIONS.filter((opt) => {
                if (opt.id === 'all') return true
                return (counts[opt.id] ?? 0) > 0
              }).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => applyIntent(opt.id)}
                  className={`events-intent-pill ${
                    selectedIntent === opt.id ? 'events-intent-pill-active' : ''
                  }`}
                >
                  {opt.label}
                  {opt.id !== 'all' && counts[opt.id] ? (
                    <span className="events-intent-count">{counts[opt.id]}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </header>

          {featured.length > 0 ? (
            <section className="events-featured-section" aria-labelledby="events-featured-title">
              <div className="events-section-header">
                <h2 id="events-featured-title" className="events-section-title">
                  Featured weekends
                </h2>
              </div>
              <div className="events-featured-grid">
                {featured.map((item, i) => (
                  <EventIndexCard
                    key={item.slug}
                    item={item}
                    variant="featured"
                    itemListName="events_featured_runway"
                    priority={i < 2}
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
                    {filterLabel} · {filteredUpcoming.length} listing
                    {filteredUpcoming.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              {listing.length > PLANNING_STRIP_AFTER ? (
                <>
                  <div className="events-upcoming-grid">
                    {beforeStrip.map((item, i) => (
                      <EventIndexCard
                        key={item.slug}
                        item={item}
                        variant="upcoming"
                        itemListName="events_page_upcoming"
                        priority={i < 3}
                      />
                    ))}
                  </div>
                  <EventsPlanningStrip />
                  <div className="events-upcoming-grid mt-4">
                    {afterStrip.map((item) => (
                      <EventIndexCard
                        key={item.slug}
                        item={item}
                        variant="upcoming"
                        itemListName="events_page_upcoming"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="events-upcoming-grid">
                    {listing.map((item, i) => (
                      <EventIndexCard
                        key={item.slug}
                        item={item}
                        variant="upcoming"
                        itemListName="events_page_upcoming"
                        priority={i < 3}
                      />
                    ))}
                  </div>
                  <EventsPlanningStrip />
                </>
              )}
            </section>
          ) : null}

          {listing.length === 0 && featured.length === 0 && filteredUpcoming.length === 0 ? (
            <div className="events-empty-panel">
              <h3 className="events-empty-title">Nothing in this view</h3>
              <p className="events-empty-body">
                Try a different filter or browse the full calendar.
              </p>
              <div className="events-empty-actions">
                <button type="button" onClick={() => applyIntent('all')} className="sf-btn-primary">
                  Browse all events
                </button>
                <EckeLink href="/calendar" className="sf-btn-ghost">
                  Open calendar
                </EckeLink>
              </div>
            </div>
          ) : null}

          {pastCards.length > 0 ? (
            <details className="events-past-section" open={filteredUpcoming.length === 0}>
              <summary>
                <h2 className="events-section-title">Past events</h2>
                <p className="events-section-meta mt-1">
                  Archived listings for reference. Confirm next dates with organizers. · {pastCards.length}{' '}
                  archived
                </p>
              </summary>
              <div className="events-past-grid">
                {pastCards.slice(0, 12).map((item) => (
                  <EventIndexCard
                    key={item.slug}
                    item={item}
                    variant="past"
                    itemListName="events_page_past"
                  />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  )
}
