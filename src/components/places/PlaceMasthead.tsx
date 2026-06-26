import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import PlaceMediaStage, { PlaceTypeBadge } from '@/components/places/PlaceMediaStage'
import { privacyModeLabel } from '@/lib/publicPlaceIndex'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

export default function PlaceMasthead({ place }: Props) {
  return (
    <header className="place-masthead">
      <div className="place-masthead-media">
        <PlaceMediaStage place={place} size="masthead" />
      </div>
      <div className="place-masthead-body">
        <PlaceTypeBadge place={place} />
        <h1 className="place-masthead-title">{place.name}</h1>
        <p className="place-masthead-location">
          {place.city}, {place.state}
        </p>
        <p className="place-masthead-type-line">
          {place.categoryLabel ?? ''}
          {place.categoryLabel ? ' · ' : ''}
          {privacyModeLabel(place.venuePrivacyMode)}
        </p>
        {place.shortSummary ? <p className="place-masthead-summary">{place.shortSummary}</p> : null}

        <div className="place-masthead-actions">
          {place.websiteUrl ? (
            <OutboundWebsiteLink
              href={place.websiteUrl}
              entityType={place.routeKind === 'swing_club' ? 'swingClub' : 'dungeon'}
              entitySlug={place.slug}
              entityName={place.name}
              className="place-btn place-btn-neutral"
            >
              Visit website
            </OutboundWebsiteLink>
          ) : null}
          <EckeLink href="#events-here" className="place-btn place-btn-view">
            View upcoming events
          </EckeLink>
          <KinkSocialCtaLink
            href={
              place.followUrl ??
              buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'dungeon_page', {
                ref: 'ecke_place_follow',
                ecke_place: place.slug,
              })
            }
            label="Follow on kink.social"
            variant="dungeon"
            surface="place_masthead"
            className="place-btn place-btn-save"
            external
          />
          <EckeLink href="/contact" className="place-btn place-btn-ghost">
            Suggest an edit
          </EckeLink>
        </div>
      </div>
    </header>
  )
}
