'use client'

import EckeLink from '@/components/EckeLink'
import AdaptiveEventMedia from '@/components/storefront/AdaptiveEventMedia'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { eventBrandStyle } from '@/lib/eventBrandTheme'
import { type EventIndexCardModel } from '@/lib/publicEventIndex'

type Props = {
  item: EventIndexCardModel
  itemListName?: string
  variant?: 'featured' | 'upcoming' | 'past'
  priority?: boolean
}

function typeBadge(item: EventIndexCardModel): string {
  if (item.listingKind === 'convention') return 'Convention'
  if (item.eventType === 'hotel_weekend') return 'Hotel weekend'
  if (item.eventType === 'class') return 'Class'
  if (item.eventType === 'party') return 'Party'
  if (item.eventType === 'vendor_market') return 'Vendor market'
  if (item.eventType === 'campout') return 'Outdoor'
  return item.category
}

export default function EventIndexCard({
  item,
  itemListName = 'events_index',
  variant = 'upcoming',
  priority = false,
}: Props) {
  const isPast = variant === 'past'
  const isFeatured = variant === 'featured'
  const isCompact = !isFeatured
  const href = `/events/${item.slug}`
  const viewLabel = isPast
    ? 'View archive'
    : item.listingKind === 'convention'
      ? 'View convention'
      : 'View event'

  const trackClick = () =>
    trackSelectItemEntity({
      entityType: 'event',
      slug: item.slug,
      name: item.title,
      itemListName,
    })

  return (
    <article
      className={`event-index-card sf-card-lift ${
        isFeatured ? 'event-index-card-featured' : 'event-index-card-compact'
      } ${isPast ? 'event-index-card-past' : ''}`}
      style={eventBrandStyle(item.brand)}
    >
      <EckeLink href={href} className="event-index-card-primary group" onClick={trackClick}>
        <AdaptiveEventMedia
          media={item.media}
          brand={item.brand}
          size={isFeatured ? 'showcase' : 'rail'}
          priority={priority}
        />
        <div className="event-index-card-body">
          <p className="event-index-card-meta event-index-card-date">{item.dateDisplay}</p>
          <h3 className="event-index-card-title">{item.title}</h3>
          <p className="event-index-card-meta">
            {item.city}, {item.state}
          </p>
          <div className="event-index-card-badges">
            <span className="event-tag">{typeBadge(item)}</span>
            {item.dancecardEnabled ? <span className="event-tag event-tag-muted">Dancecard</span> : null}
          </div>
        </div>
      </EckeLink>

      <div className={`event-index-card-actions ${isCompact ? 'event-index-card-actions-compact' : ''}`}>
        <EckeLink
          href={href}
          className={`${isPast ? 'ed-btn-ghost' : 'sf-btn-primary'} min-h-11 flex-1 py-2.5 text-center text-xs sm:text-sm`}
          onClick={trackClick}
        >
          {viewLabel}
        </EckeLink>
      </div>
    </article>
  )
}
