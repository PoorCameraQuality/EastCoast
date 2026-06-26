import EckeLink from '@/components/EckeLink'
import { publicLocationLabel } from '@/lib/publicStateIndex'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  events: PublicEventIndexItem[]
  vendors: PublicVendorListing[]
}

export default function NationwideOnlineShelf({ events, vendors }: Props) {
  if (events.length === 0 && vendors.length === 0) return null

  return (
    <section className="st-section" aria-labelledby="st-nationwide">
      <div className="st-section-head">
        <h2 id="st-nationwide" className="st-section-title">
          Nationwide &amp; online
        </h2>
        <p className="st-section-note">Not tied to a single state hub</p>
      </div>
      <ul className="st-nationwide-list">
        {events.slice(0, 4).map((event) => (
          <li key={event.slug}>
            <EckeLink href={`/events/${event.slug}`} className="st-listing-row">
              <div>
                <p className="st-listing-title">{event.title}</p>
                <p className="st-listing-meta">
                  {publicLocationLabel({ city: event.city, state: event.state, locationMode: 'online' })}
                </p>
              </div>
              <span className="st-listing-badge st-badge-event">Event</span>
            </EckeLink>
          </li>
        ))}
        {vendors.slice(0, 3).map((vendor) => (
          <li key={vendor.slug}>
            <EckeLink href={`/vendors/${vendor.slug}`} className="st-listing-row">
              <div>
                <p className="st-listing-title">{vendor.name}</p>
                <p className="st-listing-meta">Online vendor</p>
              </div>
              <span className="st-listing-badge st-badge-vendor">Vendor</span>
            </EckeLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
