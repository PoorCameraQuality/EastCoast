import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import VenueSocialLinks from '@/components/venues/VenueSocialLinks'
import { formatVenueHours } from '@/lib/formatVenueHours'
import { placeLocationDisplay, placeTypeLabel, privacyModeLabel } from '@/lib/publicPlaceIndex'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  socialMedia?: Record<string, string | undefined>
}

export default function PlaceActionDock({ place, socialMedia }: Props) {
  const mapsQuery = encodeURIComponent(place.publicAddress ?? `${place.city}, ${place.state}`)
  const showMaps = place.venuePrivacyMode === 'public_address' && Boolean(place.publicAddress)

  return (
    <aside className="place-profile-details" aria-labelledby="place-details-heading">
      <h2 id="place-details-heading" className="place-section-title">
        Venue details
      </h2>
      <dl className="place-details-list">
        <div>
          <dt>Location</dt>
          <dd>
            {placeLocationDisplay(place)}
            {place.venuePrivacyMode !== 'public_address' ? (
              <span className="place-details-note">{privacyModeLabel(place.venuePrivacyMode)}</span>
            ) : null}
            {showMaps ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="place-dock-link"
              >
                Open in Maps
              </a>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Access</dt>
          <dd>
            {placeTypeLabel(place.placeType)}
            {place.membershipInfo ? (
              <span className="place-details-note">{place.membershipInfo}</span>
            ) : place.membershipRequired ? (
              <span className="place-details-note">Membership may be required. Confirm with the venue.</span>
            ) : null}
            {place.agePolicy ? <span className="place-details-note">{place.agePolicy}</span> : null}
          </dd>
        </div>
        <div>
          <dt>Listing</dt>
          <dd>
            Public directory listing
            {place.lastSyncedAt ? (
              <span className="place-details-note">
                Updated{' '}
                {new Date(place.lastSyncedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            ) : null}
          </dd>
        </div>
        {place.websiteUrl ? (
          <div>
            <dt>Website</dt>
            <dd>
              <OutboundWebsiteLink
                href={place.websiteUrl}
                entityType={place.routeKind === 'swing_club' ? 'swingClub' : 'dungeon'}
                entitySlug={place.slug}
                entityName={place.name}
                className="place-dock-link"
              >
                Visit website
              </OutboundWebsiteLink>
            </dd>
          </div>
        ) : null}
        {place.contactPhone || place.contactEmail ? (
          <div>
            <dt>Contact</dt>
            <dd>
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
            </dd>
          </div>
        ) : null}
        {place.hours ? (
          <div>
            <dt>Hours</dt>
            <dd className="whitespace-pre-line">{formatVenueHours(place.hours)}</dd>
          </div>
        ) : null}
      </dl>
      {socialMedia ? (
        <div className="place-details-social">
          <VenueSocialLinks name={place.name} socialMedia={socialMedia} />
        </div>
      ) : null}
    </aside>
  )
}
