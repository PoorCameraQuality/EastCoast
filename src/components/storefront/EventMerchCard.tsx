'use client'

import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { StorefrontEvent } from '@/lib/homepageStorefrontData'
import { categoryBadges, formatEventDatePill, parseEventDateBlock } from '@/components/storefront/eventDateBlock'

type Props = {
  event: StorefrontEvent
  size?: 'featured' | 'compact'
  itemListName?: string
}

export default function EventMerchCard({ event, size = 'compact', itemListName = 'home_event_runway' }: Props) {
  const datePill = formatEventDatePill(event.date.start, event.date.end, event.date.display)
  const badges = categoryBadges(event.category, event.tagSlugs)
  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'home_platform', {
    ref: 'ecke_save',
    ecke_event: event.slug,
  })
  const isFeatured = size === 'featured'
  const mediaSize = isFeatured ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20'

  return (
    <article className="sf-card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-sf-card">
      <div className={`flex flex-1 ${isFeatured ? 'flex-row' : 'flex-row'}`}>
        <div className={`relative shrink-0 ${isFeatured ? 'p-4 sm:p-5' : 'p-3'}`}>
          {event.logo ? (
            <div className={`relative overflow-hidden rounded-lg bg-sf-elevated ${mediaSize}`}>
              <EventLogo
                src={event.logo}
                alt={`${event.name} logo`}
                size={isFeatured ? 'large' : 'small'}
                className="h-full w-full object-contain p-1"
              />
            </div>
          ) : (
            <div className={`sf-media-placeholder ${mediaSize}`} aria-hidden>
              <span className="text-lg font-bold tabular-nums text-sf-violet/80">
                {parseEventDateBlock(event.date.start, event.date.end).startDay}
              </span>
            </div>
          )}
        </div>

        <div className={`min-w-0 flex-1 ${isFeatured ? 'py-4 pr-4 sm:py-5 sm:pr-5' : 'py-3 pr-3'}`}>
          <span className="sf-date-pill">{datePill}</span>
          <h3
            className={`mt-2 font-sans font-semibold leading-snug text-sf-strong ${
              isFeatured ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
            }`}
          >
            {event.name}
          </h3>
          <p className="mt-1 text-xs text-sf-muted sm:text-sm">
            {event.location.city}, {event.location.state}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {badges.map((b, i) => (
              <span key={b} className={i % 2 === 1 ? 'sf-tag sf-tag-blue' : 'sf-tag'}>
                {b}
              </span>
            ))}
          </div>
          {isFeatured && event.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm text-sf-muted">{event.excerpt}</p>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 border-t border-white/10 p-3">
        <Link
          href={`/events/${event.slug}`}
          className="sf-btn-primary flex-1 py-2 text-center text-xs sm:text-sm"
          onClick={() =>
            trackSelectItemEntity({
              entityType: 'event',
              slug: event.slug,
              name: event.name,
              itemListName,
            })
          }
        >
          View event
        </Link>
        <KinkSocialCtaLink
          href={saveHref}
          label="Save on kink.social"
          variant="home"
          surface="home_event_runway"
          entitySlug={event.slug}
          className="sf-btn-rose flex-1 py-2 text-center text-xs sm:text-sm"
          external
        />
      </div>
    </article>
  )
}
