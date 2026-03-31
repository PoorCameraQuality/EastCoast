'use client'

import Link from 'next/link'
import VendorImage from '@/components/vendors/VendorImage'
import {
  getVendorCardPreviewText,
  getVendorPaidImage125Url,
  type VendorRecord,
} from '@/lib/vendorFiltering'
import type { VendorTag } from '@/data/vendorTaxonomy'

type VendorCardProps = {
  vendor: VendorRecord
  selectedTagSlugs: string[]
  tagsBySlug: Record<string, VendorTag>
}

const MAX_TAG_CHIPS = 5

export default function VendorCard({ vendor, selectedTagSlugs, tagsBySlug }: VendorCardProps) {
  const paidImageUrl = getVendorPaidImage125Url({ vendor, selectedTagSlugs })
  const preview = getVendorCardPreviewText({ vendor, maxSentences: 2 })

  const tagChips = (vendor.tagSlugs || [])
    .map((slug) => tagsBySlug[slug])
    .filter(Boolean)
    .slice(0, MAX_TAG_CHIPS)

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 shadow-lg transition duration-300 hover:border-primary-500/35 hover:shadow-primary-900/20 sm:p-5 motion-reduce:transition-none ${
        vendor.isPaid ? 'vendor-paid-sparkle' : ''
      }`}
      aria-label={vendor.name}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-400/80 via-primary-600/40 to-transparent opacity-0 transition group-hover:opacity-100 motion-reduce:opacity-0"
        aria-hidden
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <VendorImage
          src={vendor.logo125Url}
          alt={`${vendor.name} — kink vendor and BDSM gear`}
          size={125}
          className="mx-auto shrink-0 sm:mx-0"
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h3 className="font-serif text-lg font-semibold text-white sm:text-xl">
              <Link
                href={`/vendors/${vendor.slug}`}
                className="hover:text-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {vendor.name}
              </Link>
            </h3>
            {vendor.isPaid ? (
              <span className="vendor-supporter-badge shrink-0" aria-label="Supporter vendor">
                Supporter
              </span>
            ) : null}
          </div>

          {vendor.location ? (
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">{vendor.location}</p>
          ) : null}

          {tagChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {tagChips.map((t) => (
                <Link
                  key={t.slug}
                  href={`/vendors?tag=${encodeURIComponent(t.slug)}`}
                  scroll={false}
                  className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-primary-200/90 transition hover:border-primary-500/40 hover:bg-primary-950/40 hover:text-primary-100"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          ) : null}

          {preview ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400 md:line-clamp-4">
              {preview}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {vendor.websiteUrl ? (
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex min-h-touch w-full items-center justify-center px-4 py-2 text-sm sm:w-auto"
                aria-label={`Visit ${vendor.name} shop (opens in a new tab)`}
              >
                Visit shop
              </a>
            ) : (
              <Link
                href={`/vendors/${vendor.slug}`}
                className="btn-primary inline-flex min-h-touch w-full items-center justify-center px-4 py-2 text-sm sm:w-auto"
              >
                View listing
              </Link>
            )}

            <Link
              href={`/vendors/${vendor.slug}`}
              className="btn-outline inline-flex min-h-touch w-full items-center justify-center px-4 py-2 text-sm sm:w-auto"
            >
              Full profile
            </Link>
          </div>
        </div>

        {vendor.isPaid ? (
          <div className="hidden flex-shrink-0 lg:block">
            <VendorImage
              src={paidImageUrl}
              alt={`Featured product image for ${vendor.name}`}
              size={125}
            />
          </div>
        ) : null}
      </div>

      {vendor.isPaid ? (
        <div className="mt-4 border-t border-white/5 pt-4 lg:hidden">
          <p className="mb-2 text-xs text-gray-500">Supporter highlight</p>
          <VendorImage
            src={paidImageUrl}
            alt={`Featured product image for ${vendor.name}`}
            size={125}
            className="mx-auto sm:mx-0"
          />
        </div>
      ) : null}
    </article>
  )
}
