'use client'

/**
 * Compact event card for discovery grids, paginated lists, and related rails.
 * For the main /events marketing index, see {@link EventHubCard} (glass hero + logo-forward layout).
 */
import Link from 'next/link'
import EventLogo from './EventLogo'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'

interface Event {
  name: string
  slug: string
  date: {
    start: string
    end: string
    display: string
  }
  location: {
    city: string
    state: string
    region: string
  }
  excerpt: string
  logo?: string
  category: string
}

interface EventCardProps {
  event: Event
  /** GA4 `item_list_name` for `select_item` (e.g. `home_featured_events`, `events_paginated`). */
  itemListName?: string
  /** Compact: no excerpt/category; full date & location on separate lines. */
  variant?: 'default' | 'compact'
}

function DateLocationLines({
  event,
  dateClassName = 'text-sm text-gray-300',
  locClassName = 'text-sm text-gray-400',
}: {
  event: Event
  dateClassName?: string
  locClassName?: string
}) {
  return (
    <div className="space-y-1.5">
      <p className={`flex items-start gap-2 leading-snug ${dateClassName}`}>
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{event.date.display}</span>
      </p>
      <p className={`flex items-start gap-2 leading-snug ${locClassName}`}>
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>
          {event.location.city}, {event.location.state}
        </span>
      </p>
    </div>
  )
}

export default function EventCard({
  event,
  itemListName = 'events_list',
  variant = 'default',
}: EventCardProps) {
  const isCompact = variant === 'compact'

  return (
    <Link
      href={`/events/${event.slug}`}
      onClick={() =>
        trackSelectItemEntity({
          entityType: 'event',
          slug: event.slug,
          name: event.name,
          itemListName,
        })
      }
      className="group block h-full min-h-touch"
    >
      <div
        className={`h-full cursor-pointer ${
          isCompact
            ? 'card-glass flex flex-col gap-3 p-4 sm:p-5'
            : 'card-glass flex h-full flex-col p-6 sm:p-8'
        }`}
      >
        {isCompact ? <div className="card-glass-wash" aria-hidden /> : <div className="card-glass-wash" aria-hidden />}
        {isCompact ? (
          <div className="relative z-10 flex flex-1 flex-col gap-3">
            <div className="flex items-start gap-3">
              {event.logo ? (
                <div className="shrink-0 rounded-xl border border-white/10 bg-black/30 p-1 shadow-inner">
                  <EventLogo
                    src={event.logo}
                    alt={`${event.name} — kink event in ${event.location.city}, ${event.location.state}`}
                    size="small"
                  />
                </div>
              ) : null}
              <h3 className="min-w-0 flex-1 font-serif text-base font-bold leading-snug text-white line-clamp-2 transition-colors duration-300 group-hover:text-primary-300 sm:text-lg">
                {event.name}
              </h3>
            </div>
            <div className="border-t border-white/10 pt-3">
              <DateLocationLines
                event={event}
                dateClassName="text-sm font-medium text-primary-100/90"
                locClassName="text-sm text-gray-400"
              />
            </div>
            <div className="mt-auto flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary-300/90 transition-colors duration-300 group-hover:text-primary-200">
              <span>View event</span>
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex h-full flex-col">
            {event.logo ? (
              <div className="mb-4 flex-shrink-0">
                <EventLogo
                  src={event.logo}
                  alt={`${event.name} — kink event in ${event.location.city}, ${event.location.state}`}
                  size="medium"
                  className="mx-auto"
                />
              </div>
            ) : null}

            <div className="flex flex-1 flex-col">
              <h3 className="mb-2 line-clamp-2 font-serif text-xl font-bold text-white transition-colors group-hover:text-primary-400">
                {event.name}
              </h3>

              <div className="mb-3">
                <DateLocationLines event={event} />
              </div>

              <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-300">{event.excerpt}</p>
              <div className="mt-4 flex-shrink-0">
                <span className="inline-block rounded-full border border-primary-500/30 bg-gradient-to-r from-primary-600/20 to-primary-600/20 px-3 py-1 text-xs font-medium text-primary-300">
                  {event.category}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
