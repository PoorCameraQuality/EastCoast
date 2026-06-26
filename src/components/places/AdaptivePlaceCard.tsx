'use client'

import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import PlaceMediaStage, { PlaceCardSignals, PlaceTypeBadge } from '@/components/places/PlaceMediaStage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { buildKinkSocialUrl, getKinkSocialJoinUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  itemListName?: string
  variant?: 'featured' | 'default'
}

export default function AdaptivePlaceCard({
  place,
  itemListName = 'places_index',
  variant = 'default',
}: Props) {
  const isFeatured = variant === 'featured'
  const entityType =
    place.routeKind === 'swing_club' ? 'swingClub' : 'dungeon'

  const trackClick = () =>
    trackSelectItemEntity({
      entityType,
      slug: place.slug,
      name: place.name,
      itemListName,
    })

  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'dungeon_page', {
    ref: 'ecke_place',
    ecke_place: place.slug,
  })

  const eventsHref =
    (place.upcomingEventCount ?? 0) > 0
      ? `/events?location=${encodeURIComponent(place.state)}`
      : place.detailPath

  return (
    <article className={`place-index-card sf-card-lift ${isFeatured ? 'place-index-card-featured' : ''}`}>
      <EckeLink href={place.detailPath} className="place-index-card-media" onClick={trackClick}>
        <PlaceMediaStage place={place} size="card" />
      </EckeLink>

      <div className="place-index-card-body">
        <div className="place-index-card-head">
          <PlaceTypeBadge place={place} />
          {place.sourceSystem === 'kink_social' ? (
            <span className="place-source-pill">kink.social</span>
          ) : null}
        </div>

        <EckeLink href={place.detailPath} className="place-index-card-title" onClick={trackClick}>
          {place.name}
        </EckeLink>

        <p className="place-index-card-location">
          {place.city}, {place.state}
        </p>

        <PlaceCardSignals place={place} />

        {place.shortSummary ? (
          <p className="place-index-card-summary">{place.shortSummary}</p>
        ) : null}

        <div className="place-index-card-actions">
          <EckeLink href={place.detailPath} className="place-btn place-btn-view" onClick={trackClick}>
            View place
          </EckeLink>
          <EckeLink href={eventsHref} className="place-btn place-btn-events">
            Events here
          </EckeLink>
          {place.followUrl || place.sourceSystem === 'kink_social' ? (
            <KinkSocialCtaLink
              href={place.followUrl ?? saveHref}
              label="Follow on kink.social"
              variant="dungeon"
              surface="places_index_card"
              className="place-btn place-btn-save"
              external
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function PlaceOwnerCta({ compact }: { compact?: boolean }) {
  return (
    <aside className={`place-owner-cta ${compact ? 'place-owner-cta-compact' : ''}`} aria-label="Venue owners">
      <h2 className="place-owner-cta-title">Help people follow what happens here.</h2>
      <p className="place-owner-cta-body">
        Create a free kink.social organization page to manage your public presence, publish events to ECKE, and keep
        community updates connected in one place.
      </p>
      <div className="place-owner-cta-actions">
        <KinkSocialCtaLink
          href={getKinkSocialJoinUrl('dungeon_page')}
          label="Join kink.social free"
          variant="dungeon"
          surface="places_owner_cta"
          className="sf-btn-rose place-owner-btn"
          external
        />
        <KinkSocialCtaLink
          href={buildKinkSocialUrl(KINK_SOCIAL_PATHS.orgNew, 'organizer')}
          label="Create a free organization"
          variant="organizer"
          surface="places_owner_cta"
          className="sf-btn-primary place-owner-btn"
          external
        />
      </div>
    </aside>
  )
}
