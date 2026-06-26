'use client'

import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import AdaptiveEventMedia from '@/components/storefront/AdaptiveEventMedia'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import { eventBrandStyle } from '@/lib/eventBrandTheme'
import { sourceLabel, type EventIndexCardModel } from '@/lib/publicEventIndex'

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
  const href = `/events/${item.slug}`
  const srcLabel = sourceLabel(item)
  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'events_index', {
    ref: 'ecke_save',
    ecke_event: item.slug,
  })

  const trackClick = () =>
    trackSelectItemEntity({
      entityType: 'event',
      slug: item.slug,
      name: item.title,
      itemListName,
    })

  return (
    <article
      className={`event-index-card sf-card-lift ${isFeatured ? 'event-index-card-featured' : ''} ${
        isPast ? 'event-index-card-past' : ''
      }`}
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
          <div className="event-index-card-badges">
            <span className="event-tag">{typeBadge(item)}</span>
            {item.dancecardEnabled ? <span className="event-tag event-tag-muted">Dancecard</span> : null}
            {srcLabel ? <span className="event-index-source">{srcLabel}</span> : null}
          </div>
          <h3 className="event-index-card-title">{item.title}</h3>
          <p className="event-index-card-meta">{item.dateDisplay}</p>
          <p className="event-index-card-meta">
            {item.city}, {item.state}
          </p>
          {!isPast && item.summary && (isFeatured || item.listingKind === 'convention') ? (
            <p className="event-index-card-summary">{item.summary}</p>
          ) : null}
          {item.organizerName ? (
            <p className="event-index-card-organizer">{item.organizerName}</p>
          ) : null}
        </div>
      </EckeLink>

      {!isPast ? (
        <div className="event-index-card-actions">
          <EckeLink href={href} className="sf-btn-primary flex-1 py-2 text-center text-xs sm:text-sm" onClick={trackClick}>
            {item.listingKind === 'convention' ? 'View convention' : 'View event'}
          </EckeLink>
          <KinkSocialCtaLink
            href={saveHref}
            label="Save"
            variant="home"
            surface={itemListName}
            entitySlug={item.slug}
            className="sf-btn-rose flex-1 py-2 text-center text-xs sm:text-sm"
            external
          />
        </div>
      ) : (
        <div className="event-index-card-actions">
          <EckeLink href={href} className="ed-btn-ghost flex-1 py-2 text-center text-xs" onClick={trackClick}>
            View archive
          </EckeLink>
        </div>
      )}
    </article>
  )
}
