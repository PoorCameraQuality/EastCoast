import type { ReactNode } from 'react'
import EckeLink from '@/components/EckeLink'
import Breadcrumb from '@/components/Breadcrumb'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import VendorActionDock from '@/components/vendors/marketplace/VendorActionDock'
import { VendorPlatformCta } from '@/components/vendors/marketplace/AdaptiveVendorCard'
import VendorMasthead from '@/components/vendors/marketplace/VendorMasthead'
import VendorProductShelf, { VendorAppearances } from '@/components/vendors/marketplace/VendorProductShelf'
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
      {structuredData}
      <div className="container-custom section-padding">
        <Breadcrumb items={breadcrumbItems} />
        {stateAbbr ? <DiscoveryEngineStrip stateAbbr={stateAbbr} /> : null}

        <VendorMasthead vendor={vendor} />

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

            <section className="vendor-claim" aria-labelledby="vendor-claim-heading">
              <h2 id="vendor-claim-heading" className="vendor-section-title">
                Own this shop?
              </h2>
              <p className="vendor-claim-copy">
                Publish product previews, connect to events, and manage your public storefront from kink.social.
              </p>
              <EckeLink href="/contact?subject=Vendor%20Listing" className="vendor-btn vendor-btn-view">
                Suggest an edit
              </EckeLink>
            </section>
          </div>

          <VendorActionDock vendor={vendor} />
        </div>

        <div className="vendor-storefront-footer">
          <VendorPlatformCta compact />
        </div>
      </div>
    </main>
  )
}
