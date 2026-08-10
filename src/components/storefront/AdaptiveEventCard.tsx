'use client'

import EckeLink from '@/components/EckeLink'
import AdaptiveEventMedia from '@/components/storefront/AdaptiveEventMedia'
import EventDatePill from '@/components/storefront/EventDatePill'
import { categoryBadges } from '@/components/storefront/eventDateBlock'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import type { StorefrontEvent } from '@/lib/homepageStorefrontData'
import { eventBrandStyle } from '@/lib/eventBrandTheme'

type Props = {
  event: StorefrontEvent
  size?: 'showcase' | 'featured' | 'rail'
  itemListName?: string
  priority?: boolean
}

export default function AdaptiveEventCard({
  event,
  size = 'rail',
  itemListName = 'home_event_runway',
  priority = false,
}: Props) {
  const badges = categoryBadges(event.category, event.tagSlugs)
  const isShowcase = size === 'showcase'
  const isFeatured = size === 'featured'
  const eventHref = `/events/${event.slug}`

  const trackEventClick = () =>
    trackSelectItemEntity({
      entityType: 'event',
      slug: event.slug,
      name: event.name,
      itemListName,
    })

  return (
    <article
      className={`event-product-card sf-card-lift ${isShowcase ? 'event-product-card-showcase' : ''} ${
        isFeatured ? 'event-product-card-featured' : 'event-product-card-rail'
      }`}
      style={eventBrandStyle(event.brand)}
    >
      <EckeLink href={eventHref} className="event-product-primary group" onClick={trackEventClick}>
        <AdaptiveEventMedia
          media={event.media}
          brand={event.brand}
          size={isShowcase ? 'showcase' : isFeatured ? 'card' : 'rail'}
          priority={priority}
        />

        <div className="event-product-body">
          <div className="flex flex-wrap items-center gap-2">
            <EventDatePill start={event.date.start} end={event.date.end} display={event.date.display} />
            {badges.slice(0, 2).map((b, i) => (
              <span key={b} className={i === 1 ? 'event-tag event-tag-muted' : 'event-tag'}>
                {b}
              </span>
            ))}
          </div>

          <h3 className={`event-product-title ${isShowcase ? 'event-product-title-showcase' : ''}`}>
            {event.name}
          </h3>
          <p className="event-product-location">
            {event.location.city}, {event.location.state}
          </p>
          {(isShowcase || isFeatured) && event.excerpt ? (
            <p className="event-product-excerpt">{event.excerpt}</p>
          ) : null}
        </div>
      </EckeLink>

      <div className="event-product-actions">
        <EckeLink
          href={eventHref}
          className="sf-btn-primary min-h-11 flex-1 py-2.5 text-center text-xs sm:text-sm"
          onClick={trackEventClick}
        >
          View event
        </EckeLink>
      </div>
    </article>
  )
}
