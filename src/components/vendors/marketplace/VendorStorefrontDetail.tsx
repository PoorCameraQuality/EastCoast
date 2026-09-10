import type { ReactNode } from 'react'
import EckeLink from '@/components/EckeLink'
import Breadcrumb from '@/components/Breadcrumb'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import VendorActionDock from '@/components/vendors/marketplace/VendorActionDock'
import { VendorPlatformCta } from '@/components/vendors/marketplace/AdaptiveVendorCard'
import VendorMasthead from '@/components/vendors/marketplace/VendorMasthead'
import VendorProductShelf, { VendorAppearances } from '@/components/vendors/marketplace/VendorProductShelf'
import EntityPageViewTracker from '@/components/analytics/EntityPageViewTracker'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
  breadcrumbItems: Array<{ label: string; href: string; current?: boolean }>
  structuredData?: ReactNode
  stateAbbr?: string
}

export default function VendorStorefrontDetail({
  vendor,
  breadcrumbItems,
  structuredData,
  stateAbbr,
}: Props) {
  const description = vendor.description ?? ''

  return (
    <main className="vendor-storefront-page">
      <EntityPageViewTracker
        entityType="vendor"
        slug={vendor.slug}
        name={vendor.name}
        pagePath={`/vendors/${vendor.slug}`}
      />
      {structuredData}
      <div className="container-custom section-padding">
        <Breadcrumb items={breadcrumbItems} />
        {stateAbbr ? <DiscoveryEngineStrip stateAbbr={stateAbbr} /> : null}

        <VendorMasthead vendor={vendor} />

        {vendor.status === 'draft' ? (
          <p className="vendor-shelf-empty-copy" role="status">
            This shop is a draft. Visitors will not see it until you publish.
          </p>
        ) : null}

        <div className="vendor-storefront-layout">
          <div className="vendor-storefront-main">
            <VendorProductShelf vendor={vendor} />

            {description ? (
              <section className="vendor-about" aria-labelledby="vendor-about-heading">
                <h2 id="vendor-about-heading" className="vendor-section-title">
                  About the maker
                </h2>
                <div className="vendor-about-prose">{description}</div>
              </section>
            ) : null}

            {vendor.productCategories && vendor.productCategories.length > 0 ? (
              <section className="vendor-categories" aria-labelledby="vendor-makes-heading">
                <h2 id="vendor-makes-heading" className="vendor-section-title">
                  What they make
                </h2>
                <ul className="vendor-category-grid">
                  {vendor.productCategories.map((cat) => (
                    <li key={cat} className="vendor-category-tile">
                      {cat}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {vendor.acceptsCommissions ? (
              <section className="vendor-commissions" aria-labelledby="vendor-commissions-heading">
                <h2 id="vendor-commissions-heading" className="vendor-section-title">
                  Custom commissions
                </h2>
                <p className="vendor-commissions-copy">
                  {vendor.commissionInfo ??
                    'This maker accepts custom work — confirm scope, pricing, and lead times on their official shop.'}
                </p>
              </section>
            ) : null}

            <VendorAppearances vendor={vendor} />

            {vendor.organizationId ? null : (
            <section className="vendor-claim" aria-labelledby="vendor-claim-heading">
              {vendor.sourceSystem === 'kink_social' ? (
                <>
                  <h2 id="vendor-claim-heading" className="vendor-section-title">
                    Own this shop?
                  </h2>
                  <p className="vendor-claim-copy">
                    Create a free ECKE organization to manage this storefront, photos, and public listing.
                  </p>
                  <EckeLink href="/auth/org/signup" className="vendor-btn vendor-btn-view">
                    Create an organization
                  </EckeLink>
                  <EckeLink href="/vendors/my-shop" className="vendor-btn vendor-btn-save">
                    Manage your shop
                  </EckeLink>
                </>
              ) : (
                <>
                  <h2 id="vendor-claim-heading" className="vendor-section-title">
                    Own this shop?
                  </h2>
                  <p className="vendor-claim-copy">
                    Suggest a correction if this listing needs an update.
                  </p>
                  <EckeLink href="/contact?subject=Vendor%20Listing" className="vendor-btn vendor-btn-view">
                    Suggest an edit
                  </EckeLink>
                </>
              )}
            </section>
            )}
          </div>

          <VendorActionDock vendor={vendor} />
        </div>

        {vendor.organizationId ? null : (
          <div className="vendor-storefront-footer">
            <VendorPlatformCta compact />
          </div>
        )}
      </div>
    </main>
  )
}
