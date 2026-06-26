'use client'

import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import VendorMediaStage from '@/components/vendors/marketplace/VendorMediaStage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { locationDisplay } from '@/lib/publicVendorIndex'
import { buildKinkSocialUrl, getKinkSocialJoinUrl, getKinkSocialVendorOnboardingUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
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
  const shopUrl = vendor.shopUrl ?? vendor.websiteUrl

  const trackProfile = () =>
    trackSelectItemEntity({
      entityType: 'vendor',
      slug: vendor.slug,
      name: vendor.name,
      itemListName,
    })

  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'vendor_page', {
    ref: 'ecke_vendor',
    ecke_vendor: vendor.slug,
  })

  return (
    <article className={`vendor-index-card sf-card-lift ${isFeatured ? 'vendor-index-card-featured' : ''} ${vendor.supporterTier === 'supporter' ? 'vendor-index-card-supporter' : ''}`}>
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
          {vendor.supporterTier === 'supporter' ? (
            <span className="vendor-supporter-pill">Supporter</span>
          ) : null}
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
              className="vendor-btn vendor-btn-shop"
            >
              Visit shop
            </OutboundWebsiteLink>
          ) : null}
          <EckeLink href={`/vendors/${vendor.slug}`} className="vendor-btn vendor-btn-view" onClick={trackProfile}>
            View profile
          </EckeLink>
          <KinkSocialCtaLink
            href={vendor.followUrl ?? saveHref}
            label="Follow on kink.social"
            variant="vendor"
            surface="vendor_card"
            className="vendor-btn vendor-btn-save"
            external
          />
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
        Create a kink.social vendor profile so organizers and attendees can discover your work across events,
        conventions, and public ECKE listings.
      </p>
      <ul className="vendor-platform-cta-list">
        <li>Show up where organizers plan events</li>
        <li>Connect your work to conventions and nights</li>
        <li>Build a public-facing vendor presence</li>
        <li>Publish product previews when ready</li>
      </ul>
      <p className="vendor-platform-cta-disclaimer">ECKE links to public shops. Checkout stays with the vendor.</p>
      <div className="vendor-platform-cta-actions">
        <KinkSocialCtaLink
          href={getKinkSocialJoinUrl('vendor_page')}
          label="Join kink.social free"
          variant="vendor"
          surface="vendor_platform_cta"
          className="sf-btn-rose vendor-platform-btn"
          external
        />
        <KinkSocialCtaLink
          href={getKinkSocialVendorOnboardingUrl('vendor_page')}
          label="Create vendor profile"
          variant="vendor"
          surface="vendor_platform_cta"
          className="sf-btn-primary vendor-platform-btn"
          external
        />
      </div>
    </aside>
  )
}
