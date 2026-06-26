'use client'

import Link from 'next/link'
import VendorImage from '@/components/vendors/VendorImage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { getVendorCardPreviewText, type VendorRecord } from '@/lib/vendorFiltering'

type Props = {
  featured: VendorRecord | null
  vendors: VendorRecord[]
}

export default function VendorMarketPreview({ featured, vendors }: Props) {
  const rest = vendors.filter((v) => v.slug !== featured?.slug).slice(0, 4)
  const display = featured ? [featured, ...rest] : vendors.slice(0, 5)

  if (display.length === 0) return null

  const [hero, ...grid] = display

  return (
    <section className="sf-section bg-sf-surface/40" aria-labelledby="vendor-market-title">
      <div className="container-custom">
        <div className="mb-ecke-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sf-eyebrow text-sf-copper">The maker market</p>
            <h2 id="vendor-market-title" className="sf-title">
              Gear, art, books, leather, tools, and strange beautiful things.
            </h2>
          </div>
          <Link href="/vendors" className="sf-btn-gold">
            Browse vendors
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <VendorCard vendor={hero} size="featured" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {grid.slice(0, 4).map((v) => (
              <VendorCard key={v.slug} vendor={v} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function VendorCard({ vendor, size = 'compact' }: { vendor: VendorRecord; size?: 'featured' | 'compact' }) {
  const isFeatured = size === 'featured'
  const preview = getVendorCardPreviewText({ vendor, maxSentences: isFeatured ? 4 : 2 })
  const shopUrl = vendor.websiteUrl

  return (
    <article
      className={`sf-card-lift flex h-full flex-col overflow-hidden rounded-2xl border border-sf-copper/25 bg-gradient-to-br from-sf-copper/8 to-sf-card ${
        isFeatured ? 'p-6 md:p-8' : 'p-5'
      }`}
    >
      <div className="flex items-start gap-4">
        <VendorImage src={vendor.logo125Url} alt={`${vendor.name} logo`} size={isFeatured ? 125 : 48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold text-sf-strong ${isFeatured ? 'text-xl' : 'text-base'}`}>
              {vendor.name}
            </h3>
            {vendor.isPaid ? (
              <span className="rounded-full border border-sf-gold/40 bg-sf-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sf-gold">
                Featured
              </span>
            ) : null}
          </div>
          {vendor.location ? <p className="mt-1 text-xs text-sf-muted">{vendor.location}</p> : null}
        </div>
      </div>

      {vendor.tagSlugs && vendor.tagSlugs.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {vendor.tagSlugs.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-sf-copper/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sf-copper"
            >
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      ) : null}

      <p className={`mt-3 flex-1 text-sm leading-relaxed text-sf-muted ${isFeatured ? 'line-clamp-4' : 'line-clamp-2'}`}>
        {preview}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {shopUrl ? (
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sf-btn-gold text-xs"
          >
            Visit shop
          </a>
        ) : null}
        <Link
          href={`/vendors/${vendor.slug}`}
          className="sf-btn-ghost text-xs"
          onClick={() =>
            trackSelectItemEntity({
              entityType: 'vendor',
              slug: vendor.slug,
              name: vendor.name,
              itemListName: 'home_vendor_market',
            })
          }
        >
          View profile
        </Link>
      </div>
    </article>
  )
}
