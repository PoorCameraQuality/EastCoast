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
}

export default function EventCard({ event, itemListName = 'events_list' }: EventCardProps) {
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
    >
      <div className="group card-elegant md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 transition-transform duration-300 cursor-pointer h-full flex flex-col min-h-touch">
        {/* Event Logo */}
        {event.logo && (
          <div className="mb-4 flex-shrink-0">
            <EventLogo 
              src={event.logo} 
              alt={`${event.name} — kink event in ${event.location.city}, ${event.location.state}`}
              size="medium"
              className="mx-auto"
            />
          </div>
        )}
        
        {/* Event Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
            {event.name}
          </h3>
          
          {/* Date and Location */}
          <div className="space-y-1 mb-3">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date.display}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location.city}, {event.location.state}
            </p>
          </div>
          
          {/* Excerpt */}
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 flex-1">
            {event.excerpt}
          </p>
          
          {/* Category Badge */}
          <div className="mt-4 flex-shrink-0">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-600/20 to-primary-600/20 border border-primary-500/30 text-primary-300">
              {event.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

