import EckeLink from '@/components/EckeLink'
import ListingStatusBadge from '@/components/org/dashboard/ListingStatusBadge'
import type { ManagedPlaceRow } from '@/lib/eckeOrgDungeonShared'
import type { ManagedShopRow } from '@/lib/eckeOrgVendorShared'

type Props = {
  place: ManagedPlaceRow | null
  shop: ManagedShopRow | null
  productCount: number
}

export default function OrgDashboardPresence({ place, shop, productCount }: Props) {
  const placeNeedsEmail = Boolean(place && !place.contact_email)
  const shopNeedsEmail = Boolean(shop && !shop.contact_email)

  return (
    <section className="org-dashboard-presence" aria-label="Place and vendor shop">
      <div>
        <p className="org-presence-kicker">Place</p>
        {place ? (
          <>
            <h2 className="org-presence-name">{place.name}</h2>
            <p className="org-presence-meta">
              {place.city && place.state ? `${place.city}, ${place.state}` : 'Location incomplete'}
            </p>
            <p className="org-presence-meta">
              <ListingStatusBadge status={placeNeedsEmail ? 'attention' : place.status} />
              {placeNeedsEmail ? ' Add a contact email.' : null}
            </p>
            <div className="org-presence-actions">
              <EckeLink href="/dungeons/my-place" className="org-dashboard-text-link">
                Manage place
              </EckeLink>
              <EckeLink href={`/dungeons/${place.slug}`} className="org-dashboard-text-link">
                View page
              </EckeLink>
            </div>
          </>
        ) : (
          <>
            <h2 className="org-presence-name">No dungeon or club yet</h2>
            <p className="org-presence-meta">One permanent location for hours, house rules, and photos.</p>
            <div className="org-presence-actions">
              <EckeLink href="/dungeons/my-place" className="org-dashboard-text-link">
                Create location
              </EckeLink>
            </div>
          </>
        )}
      </div>

      <div>
        <p className="org-presence-kicker">Vendor shop</p>
        {shop ? (
          <>
            <h2 className="org-presence-name">{shop.name}</h2>
            <p className="org-presence-meta">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
            <p className="org-presence-meta">
              <ListingStatusBadge status={shopNeedsEmail ? 'attention' : shop.status === 'draft' ? 'draft' : 'published'} />
              {shopNeedsEmail ? ' Add a contact email.' : null}
            </p>
            <div className="org-presence-actions">
              <EckeLink href="/vendors/my-shop" className="org-dashboard-text-link">
                Manage shop
              </EckeLink>
              <EckeLink href={`/vendors/${shop.slug}`} className="org-dashboard-text-link">
                View page
              </EckeLink>
            </div>
          </>
        ) : (
          <>
            <h2 className="org-presence-name">No shop yet</h2>
            <p className="org-presence-meta">One public vendor page. Checkout stays with you.</p>
            <div className="org-presence-actions">
              <EckeLink href="/vendors/my-shop" className="org-dashboard-text-link">
                Create shop
              </EckeLink>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
