import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

export default function PlaceAmenitiesGrid({ place }: Props) {
  const tiles: { label: string; value?: string }[] = []

  for (const a of place.amenities ?? []) {
    tiles.push({ label: a })
  }
  if (place.alcoholPolicy) tiles.push({ label: 'Alcohol policy', value: place.alcoholPolicy })
  if (place.photographyPolicy) tiles.push({ label: 'Photo policy', value: place.photographyPolicy })
  if (place.dressCode) tiles.push({ label: 'Dress code', value: place.dressCode })
  if (place.parkingInfo) tiles.push({ label: 'Parking', value: place.parkingInfo })
  if (place.accessibilityNotes) tiles.push({ label: 'Accessibility', value: place.accessibilityNotes })
  if (place.consentPolicySummary) tiles.push({ label: 'House rules', value: place.consentPolicySummary })

  const unique = tiles.filter(
    (t, i, arr) => arr.findIndex((x) => x.label === t.label) === i
  )

  if (!unique.length) return null

  return (
    <section className="place-amenities" aria-labelledby="place-amenities-heading">
      <h2 id="place-amenities-heading" className="place-section-title">
        Features
      </h2>
      <ul className="place-amenities-grid">
        {unique.map((tile) => (
          <li key={tile.label} className="place-amenity-tile">
            <span className="place-amenity-label">{tile.label}</span>
            {tile.value ? <span className="place-amenity-value">{tile.value}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
