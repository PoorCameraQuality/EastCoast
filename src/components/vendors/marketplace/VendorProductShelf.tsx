'use client'

import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { getKinkSocialVendorOnboardingUrl } from '@/lib/kinkSocialMarketing'
import type { PublicVendorListing } from '@/types/publicVendorListing'
import type { PublicVendorProduct } from '@/types/publicVendorProduct'

type Props = {
  vendor: PublicVendorListing
}

function ProductCard({ product, vendor }: { product: PublicVendorProduct; vendor: PublicVendorListing }) {
  const href = product.externalUrl ?? vendor.shopUrl ?? vendor.websiteUrl
  if (!href) return null

  return (
    <OutboundWebsiteLink
      href={href}
      entityType="vendor"
      entitySlug={vendor.slug}
      entityName={vendor.name}
      className="vendor-product-card"
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={product.title} className="vendor-product-image" loading="lazy" />
      ) : (
        <div className="vendor-product-image-fallback" aria-hidden />
      )}
      <div className="vendor-product-body">
        <span className="vendor-product-title">{product.title}</span>
        {product.category ? <span className="vendor-product-category">{product.category}</span> : null}
        {product.priceLabel ? <span className="vendor-product-price">{product.priceLabel}</span> : null}
        <span className="vendor-product-cta">View item</span>
      </div>
    </OutboundWebsiteLink>
  )
}

export default function VendorProductShelf({ vendor }: Props) {
  const products = vendor.featuredProducts?.filter((p) => p.publicSafe) ?? []

  if (!products.length) {
    return (
      <section className="vendor-shelf-empty" aria-labelledby="vendor-shelf-heading">
        <h2 id="vendor-shelf-heading" className="vendor-section-title">
          Featured work
        </h2>
        <p className="vendor-shelf-empty-copy">
          No public product gallery yet. Vendors can publish product previews from kink.social.
        </p>
        <KinkSocialCtaLink
          href={getKinkSocialVendorOnboardingUrl('vendor_page')}
          label="Create or claim vendor profile"
          variant="vendor"
          surface="vendor_shelf_empty"
          className="vendor-btn vendor-btn-save"
          external
        />
      </section>
    )
  }

  return (
    <section className="vendor-shelf" aria-labelledby="vendor-shelf-heading">
      <h2 id="vendor-shelf-heading" className="vendor-section-title">
        Featured work
      </h2>
      <div className="vendor-product-grid">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} vendor={vendor} />
        ))}
      </div>
    </section>
  )
}

export function VendorAppearances({ vendor }: Props) {
  const upcoming = vendor.upcomingVendorEvents ?? []

  return (
    <section id="vendor-events" className="vendor-appearances" aria-labelledby="vendor-appearances-heading">
      <h2 id="vendor-appearances-heading" className="vendor-section-title">
        Where to find {vendor.name}
      </h2>

      {upcoming.length === 0 ? (
        <p className="vendor-appearances-empty">
          No public vending appearances listed yet. When kink.social connects vendors to events, they will show here.
        </p>
      ) : (
        <>
          <h3 className="vendor-appearances-subtitle">Upcoming vending appearances</h3>
          <ul className="vendor-appearances-list">
            {upcoming.map((event) => (
              <li key={event.slug}>
                <a href={`/events/${event.slug}`} className="vendor-appearance-row">
                  <span className="vendor-appearance-date">{event.dateDisplay}</span>
                  <span className="vendor-appearance-title">{event.title}</span>
                  <span className="vendor-appearance-loc">
                    {event.city}, {event.state}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
