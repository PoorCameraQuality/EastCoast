import EckeLink from '@/components/EckeLink'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendors: PublicVendorListing[]
  stateName: string
}

export default function StateVendorShelf({ vendors, stateName }: Props) {
  return (
    <section className="st-section" aria-labelledby="st-vendors">
      <div className="st-section-head">
        <h2 id="st-vendors" className="st-section-title">
          Vendors &amp; makers
        </h2>
        <EckeLink href="/vendors" className="st-btn-violet">
          All vendors
        </EckeLink>
      </div>
      {vendors.length > 0 ? (
        <div className="st-shelf-grid">
          {vendors.slice(0, 6).map((vendor) => (
            <EckeLink key={vendor.slug} href={`/vendors/${vendor.slug}`} className="st-shelf-card block">
              <p className="st-shelf-card-title">{vendor.name}</p>
              <p className="st-shelf-card-meta">
                {vendor.onlineOnly
                  ? 'Online · tables at local events'
                  : vendor.city && vendor.state
                    ? `${vendor.city}, ${vendor.state}`
                    : vendor.locationLabel ?? 'Vendor'}
              </p>
              {vendor.shortSummary ? (
                <p className="st-shelf-card-summary">{vendor.shortSummary}</p>
              ) : null}
            </EckeLink>
          ))}
        </div>
      ) : (
        <div className="st-empty">No vendors linked to {stateName} yet.</div>
      )}
    </section>
  )
}
