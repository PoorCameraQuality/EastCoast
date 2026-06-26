import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { locationDisplay } from '@/lib/publicVendorIndex'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
}

export default function VendorActionDock({ vendor }: Props) {
  const shopUrl = vendor.shopUrl ?? vendor.websiteUrl

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
        <EckeLink href="/contact?subject=Vendor%20Inquiry" className="vendor-btn vendor-btn-neutral vendor-dock-btn">
          Contact
        </EckeLink>
        <KinkSocialCtaLink
          href={
            vendor.followUrl ??
            buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'vendor_page', {
              ref: 'ecke_vendor_dock',
              ecke_vendor: vendor.slug,
            })
          }
          label="Follow on kink.social"
          variant="vendor"
          surface="vendor_action_dock"
          className="vendor-btn vendor-btn-save vendor-dock-btn"
          external
        />
      </div>

      <div className="vendor-dock-facts">
        <h3 className="vendor-dock-title">Shop</h3>
        {shopUrl ? (
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
          {vendor.sourceSystem === 'kink_social' ? 'Published from kink.social' : 'ECKE marketplace listing'}
        </p>
        {vendor.supporterTier === 'supporter' ? (
          <p className="vendor-dock-muted">Community supporter vendor</p>
        ) : null}
      </div>

      <p className="vendor-dock-disclaimer">ECKE links to public shops. Checkout stays with the vendor.</p>
    </aside>
  )
}
