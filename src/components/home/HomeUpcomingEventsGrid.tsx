'use client'

import Link from 'next/link'
import EventCard from '@/components/EventCard'
import { getDancecardLinkForEckeSlug } from '@/lib/dancecard/directoryRegistry'

export type HomeEventRow = {
  name: string
  slug: string
  date: { start: string; end: string; display: string }
  location: { city: string; state: string; region: string }
  excerpt: string
  category: string
  logo?: string
}

type Props = {
  events: HomeEventRow[]
}

export default function HomeUpcomingEventsGrid({ events }: Props) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-black via-[#060a0f] to-black pb-10 md:pb-14"
      aria-labelledby="home-upcoming-events-title"
    >
      <div className="home-ambient right-1/4 top-8 h-72 w-72 bg-primary-600/15 opacity-70" aria-hidden />
      <div className="home-ambient bottom-20 left-0 h-56 w-56 bg-violet-600/10 opacity-60" aria-hidden />

      <div className="container-custom relative z-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400/80">
              On the calendar
            </p>
            <h2
              id="home-upcoming-events-title"
              className="font-serif text-2xl font-bold text-white sm:text-3xl"
            >
              What&apos;s{' '}
              <span className="bg-gradient-to-r from-primary-300 to-cyan-300 bg-clip-text text-transparent">
                coming up
              </span>
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              <span className="tabular-nums font-semibold text-primary-200/90">{events.length}</span> upcoming
              {events.length >= 16 ? ' · showing next 16' : ''}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Link
              href="/events"
              className="btn-outline inline-flex min-h-touch w-full items-center justify-center rounded-xl text-sm shadow-[0_0_20px_rgba(0,0,0,0.3)] sm:w-auto"
            >
              View all events
            </Link>
            <Link
              href="/calendar"
              className="inline-flex min-h-touch w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2 text-sm font-medium text-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-primary-400/30 hover:bg-white/10 sm:w-auto"
            >
              Calendar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
          {events.map((event) => {
            const dancecardLive = Boolean(getDancecardLinkForEckeSlug(event.slug))
            return (
              <div key={event.slug} className="group relative">
                {dancecardLive ? (
                  <span className="absolute right-3 top-3 z-10 rounded-full border border-amber-400/50 bg-amber-500/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-50 shadow-[0_0_16px_rgba(245,158,11,0.35)] backdrop-blur-sm">
                    Dancecard live
                  </span>
                ) : null}
                <EventCard event={event} variant="compact" itemListName="home_upcoming_events" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
