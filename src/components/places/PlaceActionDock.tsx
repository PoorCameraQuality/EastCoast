import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import VenueSocialLinks from '@/components/venues/VenueSocialLinks'
import { formatVenueHours } from '@/lib/formatVenueHours'
import { placeTypeLabel, privacyModeLabel } from '@/lib/publicPlaceIndex'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  socialMedia?: Record<string, string | undefined>
}

function locationDisplay(place: PublicPlaceListing): string {
  switch (place.venuePrivacyMode) {
    case 'public_address':
      return place.publicAddress ?? `${place.city}, ${place.state}`
    case 'hidden_until_registered':
      return 'Location shared after registration'
    case 'contact_for_location':
      return 'Contact venue for location'
    case 'approximate_area':
      return place.regionLabel ?? `${place.city}, ${place.state} area`
    default:
      return `${place.city}, ${place.state}`
  }
}

export default function PlaceActionDock({ place, socialMedia }: Props) {
  const mapsQuery = encodeURIComponent(
    place.publicAddress ?? `${place.city}, ${place.state}`
  )

  return (
    <aside className="place-action-dock" aria-label="Venue actions">
      <div className="place-dock-actions">
        {place.websiteUrl ? (
          <OutboundWebsiteLink
            href={place.websiteUrl}
            entityType={place.routeKind === 'swing_club' ? 'swingClub' : 'dungeon'}
            entitySlug={place.slug}
            entityName={place.name}
            className="place-btn place-btn-neutral place-dock-btn"
          >
            Visit website
          </OutboundWebsiteLink>
        ) : null}
        <EckeLink href="#events-here" className="place-btn place-btn-view place-dock-btn">
          Events at this place
        </EckeLink>
        <KinkSocialCtaLink
          href={
            place.followUrl ??
            buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'dungeon_page', {
              ref: 'ecke_place_dock',
              ecke_place: place.slug,
            })
          }
          label="Follow on kink.social"
          variant="dungeon"
          surface="place_action_dock"
          className="place-btn place-btn-save place-dock-btn"
          external
        />
        <EckeLink href="/contact" className="place-btn place-btn-ghost place-dock-btn">
          Suggest an edit
        </EckeLink>
      </div>

      <div className="place-dock-facts">
        <h3 className="place-dock-fact-title">Location</h3>
        <p className="place-dock-fact-body">{locationDisplay(place)}</p>
        {place.venuePrivacyMode === 'public_address' && place.publicAddress ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="place-dock-link"
          >
            Open in Maps
          </a>
        ) : null}

        <h3 className="place-dock-fact-title">Access</h3>
        <p className="place-dock-fact-body">{placeTypeLabel(place.placeType)}</p>
        {place.membershipInfo ? (
          <p className="place-dock-fact-muted">{place.membershipInfo}</p>
        ) : place.membershipRequired ? (
          <p className="place-dock-fact-muted">Membership may be required — confirm with venue</p>
        ) : null}
        {place.agePolicy ? <p className="place-dock-fact-muted">{place.agePolicy}</p> : null}

        <h3 className="place-dock-fact-title">Listing</h3>
        <p className="place-dock-fact-muted">
          {place.sourceSystem === 'kink_social' ? 'Published from kink.social' : 'Directory listing'}
        </p>
        {place.lastSyncedAt ? (
          <p className="place-dock-fact-muted">
            Updated {new Date(place.lastSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        ) : null}
        <p className="place-dock-fact-muted">{privacyModeLabel(place.venuePrivacyMode)}</p>
      </div>

      {place.contactPhone || place.contactEmail ? (
        <div className="place-dock-contact">
          <h3 className="place-dock-fact-title">Contact</h3>
          {place.contactPhone ? (
            <a href={`tel:${place.contactPhone.replace(/\D/g, '')}`} className="place-dock-link">
              {place.contactPhone}
            </a>
          ) : null}
          {place.contactEmail ? (
            <a href={`mailto:${place.contactEmail}`} className="place-dock-link break-all">
              {place.contactEmail}
            </a>
          ) : null}
        </div>
      ) : null}

      {place.hours ? (
        <div>
          <h3 className="place-dock-fact-title">Hours</h3>
          <p className="place-dock-fact-muted whitespace-pre-line">{formatVenueHours(place.hours)}</p>
        </div>
      ) : null}

      {socialMedia ? <VenueSocialLinks name={place.name} socialMedia={socialMedia} /> : null}
    </aside>
  )
}
