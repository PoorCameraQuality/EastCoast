'use client'

import { eventMatchesVenueFilter } from '@/data/events'
import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { buildEventsListUrl } from '@/lib/eventsListSearchParams'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import EventCard from '@/components/EventCard'
import SupportCTAInline from '@/components/SupportCTAInline'
import DirectoryCompactStats from '@/components/discovery/DirectoryCompactStats'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import KinkSocialAcquisitionCard from '@/components/kink-social/KinkSocialAcquisitionCard'

type EventRow = {
  slug: string
  name: string
  category: string
  date: { display: string; start: string; end: string }
  location: { city: string; state: string }
  excerpt: string
  logo?: string
  altText?: string
}

type Props = {
  allEvents: EventRow[]
  allDungeons: Array<{ slug: string; name: string; location: { city: string; state: string }; logo?: string }>
  allSwingClubs?: Array<{ slug: string; name: string; location: { city: string; state: string }; logo?: string }>
  selectedCategory: string
}

function startOfToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

function separateEventsByDate(events: EventRow[]) {
  const today = startOfToday()
  const upcomingEvents = events
    .filter((event) => new Date(event.date.end) >= today)
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
  const pastEvents = events
    .filter((event) => new Date(event.date.end) < today)
    .sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime())
  return { upcomingEvents, pastEvents }
}

function toCardEvent(event: EventRow) {
  return {
    ...event,
    location: {
      ...event.location,
      region: `${event.location.city}, ${event.location.state}`,
    },
  }
}

export default function EventsPageClient({
  allEvents,
  allDungeons,
  allSwingClubs = [],
  selectedCategory,
}: Props) {
  const categories = useMemo(() => ['Outdoor Events', 'Indoor Events'], [])
  const router = useRouter()

  const directoryStats = useMemo(() => {
    const today = startOfToday()
    let upcoming = 0
    let outdoor = 0
    let indoor = 0
    const states = new Set<string>()
    for (const e of allEvents) {
      if (e.location?.state) states.add(e.location.state)
      if (new Date(e.date.end) >= today) upcoming += 1
      if (eventMatchesVenueFilter(e, 'Outdoor Event')) outdoor += 1
      if (eventMatchesVenueFilter(e, 'Indoor Event')) indoor += 1
    }
    return { upcoming, outdoor, indoor, stateSpread: states.size }
  }, [allEvents])

  const filterSummary = useMemo(() => {
    if (selectedCategory === 'All Events') return 'All listings'
    if (selectedCategory.startsWith('Location: ')) return selectedCategory
    return selectedCategory
  }, [selectedCategory])

  const applyCategory = (next: string) => {
    router.replace(buildEventsListUrl(next))
  }

  const getCategoryForFilter = (filterLabel: string) => {
    switch (filterLabel) {
      case 'Outdoor Events':
        return 'Outdoor Event'
      case 'Indoor Events':
        return 'Indoor Event'
      default:
        return filterLabel
    }
  }

  const getFilteredEvents = (): EventRow[] => {
    if (selectedCategory === 'All Events') {
      return allEvents
    }
    if (selectedCategory.startsWith('Location: ')) {
      const location = selectedCategory.replace('Location: ', '')
      return allEvents.filter(
        (event) =>
          event.location.state.toLowerCase().includes(location.toLowerCase()) ||
          event.location.city.toLowerCase().includes(location.toLowerCase())
      )
    }
    return allEvents.filter((e) => eventMatchesVenueFilter(e, getCategoryForFilter(selectedCategory)))
  }

  const baseEvents = getFilteredEvents()
  const { upcomingEvents, pastEvents } = separateEventsByDate(baseEvents)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events', current: true },
  ]

  const filterToolbar = (
    <div
      className="flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
      role="toolbar"
      aria-label="Filter events by category"
    >
      <button
        type="button"
        onClick={() => applyCategory('All Events')}
        className={`discovery-filter-pill ${
          selectedCategory === 'All Events' ? 'discovery-filter-pill-active' : ''
        }`}
      >
        All Events
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => applyCategory(category)}
          className={`discovery-filter-pill ${
            selectedCategory === category ? 'discovery-filter-pill-active' : ''
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )

  const listingGrid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
      {upcomingEvents.map((event) => (
        <EventCard
          key={event.slug}
          event={toCardEvent(event)}
          variant="compact"
          itemListName="events_page_upcoming"
        />
      ))}
    </div>
  )

  return (
    <DiscoveryPageShell accent="primary">
      <div className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mb-4 max-w-3xl md:mb-5">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-400/90">
              Community calendar
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
              BDSM &amp; kink{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-cyan-400 bg-clip-text text-transparent">
                events
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-300">
              Conventions, parties, and weekends—filter by venue style, state, or calendar.
            </p>
            <details className="group mt-3">
              <summary className="flex min-h-touch cursor-pointer list-none items-center text-sm font-medium text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition group-open:rotate-90" aria-hidden>
                  ▶
                </span>
                About this calendar
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                We list dates and blurbs so you can plan without digging through a dozen sites. Browse{' '}
                <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  by state
                </Link>{' '}
                or the{' '}
                <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  month grid
                </Link>
                . Always confirm tickets and policies with organizers.
              </p>
            </details>
            <div className="mt-4">{filterToolbar}</div>
          </header>

          {upcomingEvents.length > 0 ? (
            <section className="mb-8 md:mb-10" aria-labelledby="events-upcoming-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400/80">
                    On the calendar
                  </p>
                  <h2
                    id="events-upcoming-heading"
                    className="font-serif text-2xl font-bold text-white sm:text-3xl"
                  >
                    <span className="bg-gradient-to-r from-primary-300 to-cyan-300 bg-clip-text text-transparent">
                      Upcoming
                    </span>
                  </h2>
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-400">{filterSummary}</span>
                  <span className="mx-1.5 text-gray-600">·</span>
                  <span className="tabular-nums">{upcomingEvents.length}</span> in view
                </p>
              </div>
              {listingGrid}
            </section>
          ) : null}

          {upcomingEvents.length > 0 ? (
            <section className="mb-8 md:mb-10">
              <KinkSocialAcquisitionCard variant="eventsIndex" />
            </section>
          ) : null}

          {pastEvents.length > 0 ? (
            <section
              className={`${upcomingEvents.length > 0 ? 'mt-10 md:mt-12' : 'mb-8 md:mb-10'}`}
              aria-labelledby="events-past-heading"
            >
              <div className="mb-4">
                <h2
                  id="events-past-heading"
                  className="font-serif text-2xl font-bold text-white sm:text-3xl"
                >
                  <span className="bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400 bg-clip-text text-transparent">
                    Past
                  </span>
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="tabular-nums">{pastEvents.length}</span> archived — confirm next dates with organizers.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.slug}
                    event={toCardEvent(event)}
                    variant="compact"
                    itemListName="events_page_past"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div
            className={`stack-ecke-md ${upcomingEvents.length > 0 || pastEvents.length > 0 ? 'border-t border-white/[0.06] pt-8' : 'pt-4'}`}
          >
              {upcomingEvents.length > 0 || pastEvents.length > 0 ? (
                <>
                  <DirectoryCompactStats
                    stats={[
                      { label: 'upcoming', value: directoryStats.upcoming, accent: true },
                      { label: 'listings', value: allEvents.length },
                      { label: 'states / regions', value: directoryStats.stateSpread },
                      { label: 'indoor', value: directoryStats.indoor },
                      { label: 'outdoor-style', value: directoryStats.outdoor },
                    ]}
                  />
                  <SupportCTAInline contextLabel="Events" variant="stack" />
                </>
              ) : null}

              <div className="mx-auto max-w-2xl">
                <div className="discovery-search-panel">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Search</p>
                  <Search
                    compact
                    events={allEvents}
                    dungeons={allDungeons}
                    swingClubs={allSwingClubs}
                    placeholder="City, state, or event name…"
                  />
                  <p className="mt-1.5 hidden text-[11px] leading-snug text-gray-600 md:block">
                    Matches events, dungeons, and swing club listings.
                  </p>
                </div>
              </div>

              <p className="hidden text-center text-[11px] leading-snug text-gray-600 md:block">
                Filter URLs are shareable—example{' '}
                <code className="rounded bg-white/5 px-1 py-0.5 text-[10px] text-gray-400">
                  /events?category=Outdoor%20Events
                </code>
              </p>
          </div>

          {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div className="py-12 text-center md:py-16">
              <div className="discovery-empty-panel mx-auto max-w-md">
                <h3 className="mb-2 text-xl font-bold text-white">Nothing in this view</h3>
                <p className="text-gray-400">
                  Try clearing filters, searching below, or{' '}
                  <button
                    type="button"
                    onClick={() => applyCategory('All Events')}
                    className="font-medium text-primary-400 underline underline-offset-2 hover:text-primary-300"
                  >
                    show all events
                  </button>
                  .
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DiscoveryPageShell>
  )
}
