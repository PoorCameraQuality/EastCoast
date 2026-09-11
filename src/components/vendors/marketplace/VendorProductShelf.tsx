'use client'

import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { vendorOffsiteShopUrl } from '@/lib/vendorOutboundUrls'
import type { PublicVendorListing } from '@/types/publicVendorListing'
import type { PublicVendorProduct } from '@/types/publicVendorProduct'

type Props = {
  vendor: PublicVendorListing
}

function ProductCard({ product, vendor }: { product: PublicVendorProduct; vendor: PublicVendorListing }) {
  const href = vendorOffsiteShopUrl(product.externalUrl, vendor.shopUrl, vendor.websiteUrl)
  const body = (
    <>
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
        {href ? <span className="vendor-product-cta">{vendor.organizationId || product.externalUrl ? 'Buy' : 'View item'}</span> : null}
      </div>
    </>
  )

  if (!href) {
    return <div className="vendor-product-card">{body}</div>
  }

  return (
    <OutboundWebsiteLink
      href={href}
      entityType="vendor"
      entitySlug={vendor.slug}
      entityName={vendor.name}
      className="vendor-product-card"
    >
      {body}
    </OutboundWebsiteLink>
  )
}

export default function VendorProductShelf({ vendor }: Props) {
  const products = vendor.featuredProducts?.filter((p) => p.publicSafe) ?? []
  const eckeOwned = Boolean(vendor.organizationId)
  const heading = eckeOwned ? 'Shop' : 'Featured work'

  if (!products.length) {
    return (
      <section className="vendor-shelf-empty" aria-labelledby="vendor-shelf-heading">
        <h2 id="vendor-shelf-heading" className="vendor-section-title">
          {heading}
        </h2>
        <p className="vendor-shelf-empty-copy">
          {eckeOwned ? 'No public products listed yet.' : 'No public product gallery yet.'}
        </p>
      </section>
    )
  }

  return (
    <section className="vendor-shelf" aria-labelledby="vendor-shelf-heading">
      <h2 id="vendor-shelf-heading" className="vendor-section-title">
        {heading}
      </h2>
      {eckeOwned ? (
        <p className="vendor-shelf-empty-copy">Buy opens this vendor's checkout. ECKE does not take payment.</p>
      ) : null}
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
  if (upcoming.length === 0) return null

  return (
    <section id="vendor-events" className="vendor-appearances" aria-labelledby="vendor-appearances-heading">
      <h2 id="vendor-appearances-heading" className="vendor-section-title">
        Where to find {vendor.name}
      </h2>
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
    </section>
  )
}
