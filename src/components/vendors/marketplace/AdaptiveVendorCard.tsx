'use client'

import EckeLink from '@/components/EckeLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import VendorMediaStage from '@/components/vendors/marketplace/VendorMediaStage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { locationDisplay } from '@/lib/publicVendorIndex'
import { vendorOffsiteShopUrl } from '@/lib/vendorOutboundUrls'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
  itemListName?: string
  variant?: 'featured' | 'default'
}

export default function AdaptiveVendorCard({
  vendor,
  itemListName = 'vendors_marketplace',
  variant = 'default',
}: Props) {
  const isFeatured = variant === 'featured'
  const shopUrl = vendorOffsiteShopUrl(vendor.shopUrl, vendor.websiteUrl)

  const trackProfile = () =>
    trackSelectItemEntity({
      entityType: 'vendor',
      slug: vendor.slug,
      name: vendor.name,
      itemListName,
    })

  return (
    <article className={`vendor-index-card sf-card-lift ${isFeatured ? 'vendor-index-card-featured' : ''}`}>
      <EckeLink href={`/vendors/${vendor.slug}`} className="vendor-index-card-media" onClick={trackProfile}>
        <VendorMediaStage vendor={vendor} size="card" />
      </EckeLink>

      <div className="vendor-index-card-body">
        <div className="vendor-index-card-head">
          {vendor.craftTags?.slice(0, 2).map((tag) => (
            <span key={tag} className="vendor-tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <EckeLink href={`/vendors/${vendor.slug}`} className="vendor-index-card-title" onClick={trackProfile}>
          {vendor.name}
        </EckeLink>

        <p className="vendor-index-card-location">{locationDisplay(vendor)}</p>

        {vendor.tagline ? <p className="vendor-index-card-tagline">{vendor.tagline}</p> : null}
        {vendor.shortSummary ? <p className="vendor-index-card-summary">{vendor.shortSummary}</p> : null}

        <div className="vendor-index-card-actions">
          {shopUrl ? (
            <OutboundWebsiteLink
              href={shopUrl}
              entityType="vendor"
              entitySlug={vendor.slug}
              entityName={vendor.name}
              className="vendor-btn vendor-btn-shop min-h-11"
            >
              Visit shop
            </OutboundWebsiteLink>
          ) : null}
          <EckeLink
            href={`/vendors/${vendor.slug}`}
            className="vendor-btn vendor-btn-view min-h-11"
            onClick={trackProfile}
          >
            View profile
          </EckeLink>
        </div>
      </div>
    </article>
  )
}

export function VendorPlatformCta({ compact }: { compact?: boolean }) {
  return (
    <aside className={`vendor-platform-cta ${compact ? 'vendor-platform-cta-compact' : ''}`} aria-label="Vendor platform">
      <h2 className="vendor-platform-cta-title">Get found where kink events happen.</h2>
      <p className="vendor-platform-cta-body">
        Create a free ECKE organization shop so organizers and attendees can discover your work across events and
        conventions.
      </p>
      <ul className="vendor-platform-cta-list">
        <li>Show up where organizers plan events</li>
        <li>Connect your work to conventions and nights</li>
        <li>Build a public-facing vendor presence</li>
        <li>Publish product previews when ready</li>
      </ul>
      <p className="vendor-platform-cta-disclaimer">ECKE links to public shops. Checkout stays with the vendor.</p>
      <div className="vendor-platform-cta-actions">
        <EckeLink href="/auth/org/signup" className="sf-btn-primary vendor-platform-btn">
          Create an organization
        </EckeLink>
        <EckeLink href="/vendors/my-shop" className="sf-btn-rose vendor-platform-btn">
          Manage your shop
        </EckeLink>
      </div>
    </aside>
  )
}
