import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import VendorMediaStage from '@/components/vendors/marketplace/VendorMediaStage'
import { locationDisplay } from '@/lib/publicVendorIndex'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
}

export default function VendorMasthead({ vendor }: Props) {
  const shopUrl = vendor.shopUrl ?? vendor.websiteUrl

  return (
    <header className="vendor-masthead">
      <div className="vendor-masthead-media">
        <VendorMediaStage vendor={vendor} size="masthead" />
      </div>
      <div className="vendor-masthead-body">
        <div className="vendor-masthead-badges">
          {vendor.craftTags?.slice(0, 3).map((tag) => (
            <span key={tag} className="vendor-tag-pill">
              {tag}
            </span>
          ))}
          {vendor.supporterTier === 'supporter' ? (
            <span className="vendor-supporter-pill">Supporter</span>
          ) : null}
        </div>
        <h1 className="vendor-masthead-title">{vendor.name}</h1>
        {vendor.tagline ? <p className="vendor-masthead-tagline">{vendor.tagline}</p> : null}
        <p className="vendor-masthead-location">{locationDisplay(vendor)}</p>
        {vendor.shortSummary ? <p className="vendor-masthead-summary">{vendor.shortSummary}</p> : null}

        <div className="vendor-masthead-actions">
          {shopUrl ? (
            <OutboundWebsiteLink
              href={shopUrl}
              entityType="vendor"
              entitySlug={vendor.slug}
              entityName={vendor.name}
              className="vendor-btn vendor-btn-shop"
            >
              Visit shop
            </OutboundWebsiteLink>
          ) : null}
          <EckeLink href="/contact?subject=Vendor%20Inquiry" className="vendor-btn vendor-btn-neutral">
            Contact vendor
          </EckeLink>
          <KinkSocialCtaLink
            href={
              vendor.followUrl ??
              buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'vendor_page', {
                ref: 'ecke_vendor_follow',
                ecke_vendor: vendor.slug,
              })
            }
            label="Follow on kink.social"
            variant="vendor"
            surface="vendor_masthead"
            className="vendor-btn vendor-btn-save"
            external
          />
          <EckeLink href="#vendor-events" className="vendor-btn vendor-btn-view">
            See events they vend
          </EckeLink>
        </div>
      </div>
    </header>
  )
}
