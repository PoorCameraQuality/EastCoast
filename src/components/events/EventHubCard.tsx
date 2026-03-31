'use client'

import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'

export type EventHubCardEvent = {
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
  event: EventHubCardEvent
  variant: 'upcoming' | 'past'
  /** GA4 `item_list_name` for listing clicks */
  itemListName?: string
}

const shell = {
  upcoming: {
    card: 'backdrop-blur-xl bg-white/10 border-white/20 hover:border-white/40 hover:shadow-primary-500/20',
    wash: 'from-primary-500/10 via-transparent to-primary-500/10',
    glow: 'from-primary-500 to-primary-500',
    badge: 'bg-primary-500/20 text-primary-300 border-primary-400/30',
    titleHover: 'group-hover:text-primary-300',
    dateIcon: 'text-primary-400',
    dateText: 'text-primary-300 font-medium',
    locIcon: 'text-gray-400',
    locText: 'text-gray-300',
    excerpt: 'text-gray-400',
  },
  past: {
    card: 'backdrop-blur-xl bg-white/5 border-white/10 hover:border-white/30 opacity-80 hover:opacity-100 hover:shadow-gray-500/20',
    wash: 'from-gray-500/10 via-transparent to-slate-500/10',
    glow: 'from-gray-500 to-slate-500',
    badge: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    titleHover: 'group-hover:text-gray-300',
    dateIcon: 'text-gray-400',
    dateText: 'text-gray-400 font-medium',
    locIcon: 'text-gray-500',
    locText: 'text-gray-500',
    excerpt: 'text-gray-500',
  },
} as const

export default function EventHubCard({ event, variant, itemListName = 'events_page' }: Props) {
  const s = shell[variant]
  const alt =
    event.altText || `${event.name} — BDSM convention in ${event.location.city}, ${event.location.state}`

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block"
      onClick={() =>
        trackSelectItemEntity({
          entityType: 'event',
          slug: event.slug,
          name: event.name,
          itemListName,
        })
      }
    >
      <div
        className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.02] md:min-h-[460px] md:hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 ${s.card} shadow-2xl`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none ${s.wash}`}
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col p-6">
          {event.logo ? (
            <div className="mb-5 flex shrink-0 justify-center md:mb-6 md:justify-start">
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r blur-lg opacity-50 transition-opacity group-hover:opacity-75 ${s.glow}`}
                  aria-hidden
                />
                <div className="md:hidden">
                  <EventLogo
                    src={event.logo}
                    alt={alt}
                    size="large"
                    className="relative rounded-2xl border border-white/20 bg-black/80 p-4 shadow-xl backdrop-blur-sm"
                  />
                </div>
                <div className="hidden md:block">
                  <EventLogo
                    src={event.logo}
                    alt={alt}
                    size="medium"
                    className="relative rounded-2xl border border-white/20 bg-black/80 p-4 shadow-xl backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col text-center md:text-left">
            <div className="mb-3 flex shrink-0 justify-center md:justify-start">
              <span
                className={`inline-block rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-sm ${s.badge}`}
              >
                {event.category}
              </span>
            </div>

            <h3
              className={`mb-3 line-clamp-2 font-serif text-xl font-bold text-white transition-colors duration-300 ${s.titleHover}`}
            >
              {event.name}
            </h3>

            <div className="mb-3 flex shrink-0 items-center justify-center gap-2 md:justify-start">
              <svg
                className={`h-4 w-4 shrink-0 ${s.dateIcon}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className={`text-sm ${s.dateText}`}>{event.date.display}</p>
            </div>

            <div className="mb-4 flex shrink-0 items-center justify-center gap-2 md:justify-start">
              <svg
                className={`h-4 w-4 shrink-0 ${s.locIcon}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className={`text-sm ${s.locText}`}>
                {event.location.city}, {event.location.state}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <p className={`line-clamp-3 leading-relaxed md:line-clamp-4 ${s.excerpt}`}>{event.excerpt}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
