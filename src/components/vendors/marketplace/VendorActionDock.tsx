import EckeLink from '@/components/EckeLink'
import VendorContactLink from '@/components/vendors/marketplace/VendorContactLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { locationDisplay } from '@/lib/publicVendorIndex'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
}

export default function VendorActionDock({ vendor }: Props) {
  const shopUrl = vendor.shopUrl ?? vendor.websiteUrl
  const officialWebsite = vendor.websiteUrl && vendor.websiteUrl !== shopUrl ? vendor.websiteUrl : null

  return (
    <aside className="vendor-action-dock" aria-label="Shop actions">
      <div className="vendor-dock-actions">
        {shopUrl ? (
          <OutboundWebsiteLink
            href={shopUrl}
            entityType="vendor"
            entitySlug={vendor.slug}
            entityName={vendor.name}
            className="vendor-btn vendor-btn-shop vendor-dock-btn"
          >
            Visit shop
          </OutboundWebsiteLink>
        ) : null}
        <VendorContactLink vendor={vendor} label="Contact" className="vendor-btn vendor-btn-neutral vendor-dock-btn" />
      </div>

      <div className="vendor-dock-facts">
        <h3 className="vendor-dock-title">Shop</h3>
        {officialWebsite ? (
          <OutboundWebsiteLink
            href={officialWebsite}
            entityType="vendor"
            entitySlug={vendor.slug}
            entityName={vendor.name}
            className="vendor-dock-link"
          >
            Official shop / website
          </OutboundWebsiteLink>
        ) : shopUrl ? (
          <OutboundWebsiteLink
            href={shopUrl}
            entityType="vendor"
            entitySlug={vendor.slug}
            entityName={vendor.name}
            className="vendor-dock-link"
          >
            Official shop / website
          </OutboundWebsiteLink>
        ) : (
          <p className="vendor-dock-muted">No public shop link listed</p>
        )}

        <h3 className="vendor-dock-title">Location</h3>
        <p className="vendor-dock-body">{locationDisplay(vendor)}</p>

        {vendor.acceptsCommissions ? (
          <>
            <h3 className="vendor-dock-title">Commissions</h3>
            <p className="vendor-dock-muted">{vendor.commissionInfo ?? 'Custom work available'}</p>
          </>
        ) : null}

        {vendor.dungeonListingSlug ? (
          <>
            <h3 className="vendor-dock-title">Venue link</h3>
            <EckeLink href={`/dungeons/${vendor.dungeonListingSlug}`} className="vendor-dock-link">
              View linked place
            </EckeLink>
          </>
        ) : null}

        <h3 className="vendor-dock-title">Listing</h3>
        <p className="vendor-dock-muted">
          {vendor.organizationId ? 'Listed by the organizer on ECKE' : 'ECKE marketplace listing'}
        </p>
        {vendor.lastSyncedAt ? (
          <p className="vendor-dock-muted">
            Updated {new Date(vendor.lastSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        ) : null}
        {vendor.supporterTier === 'supporter' ? (
          <p className="vendor-dock-muted">Community supporter vendor</p>
        ) : null}
      </div>

      <p className="vendor-dock-disclaimer">ECKE links to public shops. Checkout stays with the vendor.</p>
    </aside>
  )
}
