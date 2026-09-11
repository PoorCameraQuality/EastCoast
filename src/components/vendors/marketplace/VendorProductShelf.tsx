'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { listingCopyToSafeHtml } from '@/lib/eckeOrgRichText'
import { vendorOffsiteShopUrl } from '@/lib/vendorOutboundUrls'
import type { PublicVendorListing } from '@/types/publicVendorListing'
import type { PublicProductMedia, PublicVendorProduct } from '@/types/publicVendorProduct'

type Props = {
  vendor: PublicVendorListing
}

function productMedia(product: PublicVendorProduct): PublicProductMedia[] {
  if (product.media?.length) return product.media
  if (product.imageUrl) {
    return [{ id: `${product.id}-cover`, url: product.imageUrl, kind: 'image', sortOrder: 0 }]
  }
  return []
}

function ProductDetailDialog({
  product,
  vendor,
  open,
  onClose,
}: {
  product: PublicVendorProduct | null
  vendor: PublicVendorListing
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const media = useMemo(() => (product ? productMedia(product) : []), [product])
  const [activeIndex, setActiveIndex] = useState(0)
  const href = product
    ? vendorOffsiteShopUrl(product.externalUrl, vendor.shopUrl, vendor.websiteUrl)
    : undefined
  const descriptionHtml = product?.description ? listingCopyToSafeHtml(product.description) : ''

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && product) {
      setActiveIndex(0)
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open, product])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onDialogClose = () => onClose()
    dialog.addEventListener('close', onDialogClose)
    return () => dialog.removeEventListener('close', onDialogClose)
  }, [onClose])

  const active = media[activeIndex] || media[0]

  return (
    <dialog ref={dialogRef} className="vendor-product-dialog" aria-labelledby="vendor-product-dialog-title">
      {product ? (
        <div className="vendor-product-dialog-inner">
          <button type="button" className="vendor-product-dialog-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <div className="vendor-product-dialog-gallery">
            {media.length > 1 ? (
              <div className="vendor-product-thumbs" role="tablist" aria-label="Product media">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    className={`vendor-product-thumb${index === activeIndex ? ' is-active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    {item.kind === 'video' ? (
                      <video src={item.url} muted playsInline className="vendor-product-thumb-media" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" className="vendor-product-thumb-media" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="vendor-product-stage">
              {active ? (
                active.kind === 'video' ? (
                  <video key={active.id} src={active.url} controls playsInline className="vendor-product-stage-media" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.url} alt={product.title} className="vendor-product-stage-media" />
                )
              ) : (
                <div className="vendor-product-image-fallback" aria-hidden />
              )}
              {media.length > 1 ? (
                <div className="vendor-product-stage-nav">
                  <button
                    type="button"
                    className="vendor-product-nav-btn"
                    aria-label="Previous media"
                    onClick={() => setActiveIndex((i) => (i - 1 + media.length) % media.length)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="vendor-product-nav-btn"
                    aria-label="Next media"
                    onClick={() => setActiveIndex((i) => (i + 1) % media.length)}
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div className="vendor-product-dialog-copy">
            <h2 id="vendor-product-dialog-title" className="vendor-product-dialog-title">
              {product.title}
            </h2>
            {product.priceLabel ? <p className="vendor-product-dialog-price">{product.priceLabel}</p> : null}
            {product.category ? <p className="vendor-product-dialog-category">{product.category}</p> : null}
            {descriptionHtml ? (
              <div
                className="vendor-product-dialog-description"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}
            {href ? (
              <OutboundWebsiteLink
                href={href}
                entityType="vendor"
                entitySlug={vendor.slug}
                entityName={vendor.name}
                className="vendor-product-dialog-buy"
              >
                {vendor.organizationId || product.externalUrl ? 'Buy on vendor site' : 'View listing'}
              </OutboundWebsiteLink>
            ) : (
              <p className="vendor-shelf-empty-copy">No external listing URL yet.</p>
            )}
            <p className="vendor-product-dialog-note">ECKE does not take payment. Checkout stays with the vendor.</p>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}

function ProductCard({
  product,
  vendor,
  onOpen,
}: {
  product: PublicVendorProduct
  vendor: PublicVendorListing
  onOpen: () => void
}) {
  const media = productMedia(product)
  const cover = media.find((item) => item.kind === 'image') || media[0]
  return (
    <button type="button" className="vendor-product-card" onClick={onOpen}>
      {cover ? (
        cover.kind === 'video' ? (
          <video src={cover.url} className="vendor-product-image" muted playsInline preload="metadata" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={product.title} className="vendor-product-image" loading="lazy" />
        )
      ) : (
        <div className="vendor-product-image-fallback" aria-hidden />
      )}
      <div className="vendor-product-body">
        <span className="vendor-product-title">{product.title}</span>
        {product.category ? <span className="vendor-product-category">{product.category}</span> : null}
        {product.priceLabel ? <span className="vendor-product-price">{product.priceLabel}</span> : null}
        <span className="vendor-product-cta">View details</span>
      </div>
    </button>
  )
}

export default function VendorProductShelf({ vendor }: Props) {
  const products = vendor.featuredProducts?.filter((p) => p.publicSafe) ?? []
  const eckeOwned = Boolean(vendor.organizationId)
  const heading = eckeOwned ? 'Shop' : 'Featured work'
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeProduct = products.find((product) => product.id === activeId) || null

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
        <p className="vendor-shelf-empty-copy">
          Open a product for details. Buy goes to the vendor&apos;s site — ECKE does not take payment.
        </p>
      ) : null}
      <div className="vendor-product-grid">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} vendor={vendor} onOpen={() => setActiveId(product.id)} />
        ))}
      </div>
      <ProductDetailDialog
        product={activeProduct}
        vendor={vendor}
        open={Boolean(activeProduct)}
        onClose={() => setActiveId(null)}
      />
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
