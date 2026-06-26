import EckeLink from '@/components/EckeLink'
import { publicLocationLabel } from '@/lib/publicStateIndex'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  places: PublicPlaceListing[]
  stateName: string
}

export default function StatePlacesShelf({ places, stateName }: Props) {
  return (
    <section className="st-section" aria-labelledby="st-places">
      <div className="st-section-head">
        <h2 id="st-places" className="st-section-title">
          Places &amp; venues
        </h2>
        <EckeLink href="/dungeons" className="st-btn-violet">
          All places
        </EckeLink>
      </div>
      {places.length > 0 ? (
        <div className="st-shelf-grid">
          {places.slice(0, 6).map((place) => (
            <EckeLink key={place.slug} href={place.detailPath} className="st-shelf-card block">
              <p className="st-shelf-card-title">{place.name}</p>
              <p className="st-shelf-card-meta">
                {publicLocationLabel({
                  city: place.city,
                  state: place.state,
                  regionLabel: place.regionLabel,
                  locationMode:
                    place.venuePrivacyMode === 'city_only'
                      ? 'city_only'
                      : place.venuePrivacyMode === 'hidden_until_registered'
                        ? 'hidden_until_registered'
                        : place.venuePrivacyMode === 'contact_for_location'
                          ? 'contact_for_location'
                          : 'public',
                })}
              </p>
              {place.shortSummary ? (
                <p className="st-shelf-card-summary">{place.shortSummary}</p>
              ) : null}
            </EckeLink>
          ))}
        </div>
      ) : (
        <div className="st-empty">No public venues listed for {stateName} yet.</div>
      )}
    </section>
  )
}
