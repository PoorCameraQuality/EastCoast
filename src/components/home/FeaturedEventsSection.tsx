'use client'

import Link from 'next/link'
import { getUpcomingEvents } from '@/data/events'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import VendorImage from '@/components/vendors/VendorImage'

export default function FeaturedEventsSection() {
  const upcomingEvents = getUpcomingEvents()

  // "Sticky featured" support: once events have `isFeatured: true`, those will always be included first.
  // Until then, this behaves like a simple slice of upcoming events.
  const isFeatured = (e: unknown) => Boolean((e as { isFeatured?: boolean } | null)?.isFeatured)
  const sticky = upcomingEvents.filter((e) => isFeatured(e))
  const rest = upcomingEvents.filter((e) => !isFeatured(e))
  const featured = [...sticky, ...rest].slice(0, 8)

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden" aria-labelledby="featured-events-title">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 id="featured-events-title" className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
              Featured Upcoming Events
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              Upcoming conventions and parties—scroll for this season, then hit{' '}
              <Link href="/calendar" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
                calendar
              </Link>{' '}
              or{' '}
              <Link href="/states" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
                your state
              </Link>{' '}
              for more.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:shrink-0">
            <Link href="/events" className="btn-outline text-sm px-5 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center w-full sm:w-auto" aria-label="View all events">
              View All Events
            </Link>
            <Link href="/contact" className="btn-primary text-sm px-5 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center w-full sm:w-auto" aria-label="Contact us">
              {CONTACT_US_LABEL}
            </Link>
          </div>
        </div>

        {/* Mobile: horizontal carousel */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {featured.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="snap-start min-w-[280px] group"
                aria-label={`View event: ${event.name}`}
              >
                <article className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-primary-400/30 group-hover:shadow-elegant-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      {event.logo ? (
                        <VendorImage src={event.logo} alt={`${event.name} logo`} size={48} className="flex-shrink-0" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-serif font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-300 transition-colors duration-300">
                          {event.name}
                        </h3>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{event.date.display}</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      {event.location.city}, {event.location.state}
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                      {event.excerpt}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-primary-300 font-semibold">
                      <span>View Event</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 8).map((event) => (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className="group"
              aria-label={`View event: ${event.name}`}
            >
              <article className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-colors duration-500 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 hover:border-primary-400/30 hover:shadow-elegant-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/8 via-transparent to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    {event.logo ? (
                      <VendorImage src={event.logo} alt={`${event.name} logo`} size={48} className="flex-shrink-0" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{event.date.display}</span>
                      </div>
                      <h3 className="text-xl font-serif font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-300 transition-colors duration-300">
                        {event.name}
                      </h3>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    {event.location.city}, {event.location.state}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                    {event.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

