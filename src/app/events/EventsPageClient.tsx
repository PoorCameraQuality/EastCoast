'use client'

import { eventMatchesVenueFilter } from '@/data/events'
import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { buildEventsListUrl } from '@/lib/eventsListSearchParams'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import SupportCTAInline from '@/components/SupportCTAInline'
import NewsletterSignup from '@/components/NewsletterSignup'
import EventHubCard from '@/components/events/EventHubCard'

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
  allDungeons: Array<{ slug: string; name: string }>
  /** Derived on the server from URL — single source of truth for filters (SEO / crawlers). */
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

export default function EventsPageClient({ allEvents, allDungeons, selectedCategory }: Props) {
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
        <div className="absolute bottom-32 left-0 h-64 w-64 rounded-full bg-cyan-600/80 blur-3xl" />
      </div>

      <div className="relative z-10 section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <SupportCTAInline contextLabel="Events" />

          <div className="mx-auto mb-8 max-w-xl">
            <NewsletterSignup variant="compact" />
          </div>

          <header className="mx-auto mb-10 max-w-3xl md:mb-12">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">
              Community calendar
            </p>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              BDSM &amp; kink{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-cyan-400 bg-clip-text text-transparent">
                events
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
              Conventions, hotel weekends, workshops, and parties—we list dates and blurbs so you can plan without
              digging through a dozen sites. Filter by indoor or outdoor venue style, or browse{' '}
              <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                by state
              </Link>
              , the{' '}
              <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                month grid
              </Link>
              , and{' '}
              <Link
                href="/education"
                className="text-primary-400 underline underline-offset-2 hover:text-primary-300"
              >
                education
              </Link>{' '}
              for deeper dives. Always confirm tickets and policies with organizers.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                <span className="tabular-nums font-semibold text-white">{allEvents.length}</span> listings
              </div>
              <div className="rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2 text-sm text-primary-100/90">
                <span className="tabular-nums font-semibold">{directoryStats.upcoming}</span> upcoming
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                <span className="tabular-nums font-semibold text-white">{directoryStats.stateSpread}</span> states /
                regions
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-400">
                Indoor{' '}
                <span className="font-medium text-gray-300">{directoryStats.indoor}</span>
                <span className="mx-1.5 text-gray-600">·</span>
                outdoor-style{' '}
                <span className="font-medium text-gray-300">{directoryStats.outdoor}</span>
              </div>
            </div>
          </header>

          <div className="mx-auto mb-8 max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-lg sm:p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Search</p>
              <Search events={allEvents} dungeons={allDungeons} placeholder="City, state, or event name…" />
              <p className="mt-3 text-xs text-gray-600">
                Matches events and dungeon listings—open a row to go straight to the detail page.
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-primary-500/40 bg-primary-600/10 px-6 py-3 text-sm font-semibold text-primary-100 transition hover:border-primary-400 hover:bg-primary-600/20"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
            <Link
              href="/vendors"
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              Vendors &amp; makers
            </Link>
            <Link
              href="/dungeons"
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              Play spaces
            </Link>
          </div>

          <div className="mb-6">
            <div
              className="flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible"
              role="toolbar"
              aria-label="Filter events by category"
            >
              <button
                type="button"
                onClick={() => applyCategory('All Events')}
                className={`group inline-flex min-h-touch shrink-0 snap-start items-center rounded-full px-5 py-3 font-bold shadow-xl transition duration-300 md:px-6 md:hover:scale-105 motion-reduce:md:hover:scale-100 ${
                  selectedCategory === 'All Events'
                    ? 'bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 text-white hover:from-primary-700 hover:via-primary-700 hover:to-primary-800 hover:shadow-primary-500/25'
                    : 'border border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 hover:shadow-white/25'
                }`}
              >
                <span className="flex items-center gap-2">
                  All Events
                  {selectedCategory === 'All Events' ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => applyCategory(category)}
                  className={`group inline-flex min-h-touch shrink-0 snap-start items-center rounded-full px-5 py-3 font-bold shadow-xl transition duration-300 md:px-6 md:hover:scale-105 motion-reduce:md:hover:scale-100 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 text-white hover:from-primary-700 hover:via-primary-700 hover:to-primary-800 hover:shadow-primary-500/25'
                      : 'border border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 hover:shadow-white/25'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category}
                    {selectedCategory === category ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-gray-600 md:px-4">
              Filter URLs are shareable—example{' '}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-[0.7rem] text-gray-400">
                /events?category=Outdoor%20Events
              </code>
              .
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <section className="mb-14 md:mb-16" aria-labelledby="events-upcoming-heading">
              <div className="mb-8 text-center md:text-left">
                <h2
                  id="events-upcoming-heading"
                  className="font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                >
                  <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                    Upcoming
                  </span>
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-gray-400 md:mx-0">
                  Sorted by start date. Open a card for the full write-up, links, and map context when we have it.
                </p>
                <p className="mt-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-400">{filterSummary}</span>
                  <span className="mx-2 text-gray-600">·</span>
                  <span className="tabular-nums">{upcomingEvents.length}</span> upcoming
                  {pastEvents.length > 0 ? (
                    <>
                      <span className="mx-2 text-gray-600">·</span>
                      <span className="tabular-nums">{pastEvents.length}</span> past in this view
                    </>
                  ) : null}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventHubCard
                    key={event.slug}
                    event={event}
                    variant="upcoming"
                    itemListName="events_page_upcoming"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {pastEvents.length > 0 ? (
            <section className="mb-6" aria-labelledby="events-past-heading">
              <div className="mb-8 text-center md:text-left">
                <h2
                  id="events-past-heading"
                  className="font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                >
                  <span className="bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400 bg-clip-text text-transparent">
                    Past
                  </span>
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-gray-500 md:mx-0">
                  Archive for context—check official sites for next year&apos;s dates.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventHubCard
                    key={event.slug}
                    event={event}
                    variant="past"
                    itemListName="events_page_past"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div className="py-12 text-center md:py-16">
              <div className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-gray-600 to-slate-600">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Nothing in this view</h3>
                <p className="text-gray-400">
                  Try clearing filters, searching above, or{' '}
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
    </div>
  )
}
