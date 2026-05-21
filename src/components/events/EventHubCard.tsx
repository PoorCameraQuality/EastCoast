'use client'

/**
 * Large “hub” event tile for the primary /events page (upcoming/past tabs).
 * Discovery and paginated routes use {@link EventCard} for a denser grid.
 */
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

const tone = {
  upcoming: {
    wash: '',
    badge: 'bg-primary-500/20 text-primary-300 border-primary-400/30',
    titleHover: 'group-hover:text-primary-300',
    dateText: 'text-primary-100/90 font-medium',
    locText: 'text-gray-300',
    excerpt: 'text-gray-400',
    cta: 'text-primary-300/90 group-hover:text-primary-200',
  },
  past: {
    wash: 'card-glass-wash-violet opacity-60',
    badge: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    titleHover: 'group-hover:text-gray-300',
    dateText: 'text-gray-400 font-medium',
    locText: 'text-gray-500',
    excerpt: 'text-gray-500',
    cta: 'text-gray-400 group-hover:text-gray-300',
  },
} as const

export default function EventHubCard({ event, variant, itemListName = 'events_page' }: Props) {
  const s = tone[variant]
  const alt =
    event.altText || `${event.name} — BDSM convention in ${event.location.city}, ${event.location.state}`
  const isPast = variant === 'past'

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block h-full"
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
        className={`card-glass card-glass-hub relative flex h-full min-h-0 flex-col md:min-h-[460px] ${
          isPast ? 'card-glass-muted' : ''
        }`}
      >
        <div className={`card-glass-wash ${s.wash}`} aria-hidden />

        <div className="relative z-10 flex h-full flex-col p-6">
          {event.logo ? (
            <div className="mb-5 flex shrink-0 justify-center md:mb-6 md:justify-start">
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r blur-lg opacity-50 transition-opacity group-hover:opacity-75 ${
                    isPast ? 'from-gray-500 to-slate-500' : 'from-primary-500 to-cyan-500'
                  }`}
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
                className="h-4 w-4 shrink-0 text-primary-400"
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
                className="h-4 w-4 shrink-0 text-gray-400"
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

            <div
              className={`mt-4 flex shrink-0 items-center justify-center gap-1.5 text-sm font-semibold transition-colors duration-300 md:justify-start ${s.cta}`}
            >
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
        </div>
      </div>
    </Link>
  )
}
