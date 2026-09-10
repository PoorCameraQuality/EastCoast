import EckeLink from '@/components/EckeLink'
import PlaceHeroMedia from '@/components/places/PlaceHeroMedia'
import { PlaceTypeBadge } from '@/components/places/PlaceMediaStage'
import { privacyModeLabel } from '@/lib/publicPlaceIndex'
import { ECKE_DISCORD_INVITE_URL, ECKE_DISCORD_LABEL } from '@/lib/eckeCommunity'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

function listingStatusLabel(place: PublicPlaceListing) {
  if (place.status === 'temporarily_closed') return 'Temporarily closed'
  if (place.status === 'archived') return 'Archived listing'
  return 'Public listing'
}

export default function PlaceMasthead({ place }: Props) {
  return (
    <header className="place-profile-hero" id="place-profile-hero">
      <PlaceHeroMedia place={place} />

      <div className="place-profile-hero-body">
        <div className="place-profile-eyebrows">
          <PlaceTypeBadge place={place} />
          <span className="place-listing-status">{listingStatusLabel(place)}</span>
        </div>
        <h1 className="place-profile-title">{place.name}</h1>
        <p className="place-profile-location">
          {place.city}, {place.state}
        </p>
        <p className="place-profile-access">
          {place.categoryLabel ? `${place.categoryLabel} · ` : ''}
          {privacyModeLabel(place.venuePrivacyMode)}
        </p>
        {place.shortSummary ? <p className="place-profile-summary">{place.shortSummary}</p> : null}

        <div className="place-profile-actions">
          <EckeLink href="#events-here" className="place-profile-primary">
            View upcoming events
          </EckeLink>
          <a
            href={ECKE_DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="place-profile-secondary"
          >
            {ECKE_DISCORD_LABEL}
          </a>
          <EckeLink href="/contact" className="place-profile-tertiary">
            Suggest an edit
          </EckeLink>
        </div>
      </div>
    </header>
  )
}
