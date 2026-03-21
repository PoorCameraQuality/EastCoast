'use client'

import Link from 'next/link'
import VendorImage from '@/components/vendors/VendorImage'
import { getVendorCardPreviewText, getVendorPaidImage125Url, type VendorRecord } from '@/lib/vendorFiltering'

type VendorCardProps = {
  vendor: VendorRecord
  selectedTagSlugs: string[]
}

export default function VendorCard({ vendor, selectedTagSlugs }: VendorCardProps) {
  const paidImageUrl = getVendorPaidImage125Url({ vendor, selectedTagSlugs })
  const preview = getVendorCardPreviewText({ vendor, maxSentences: 3 })

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6 transition-shadow duration-300 md:hover:shadow-elegant-lg motion-reduce:transition-none ${
        vendor.isPaid ? 'vendor-paid-sparkle' : ''
      }`}
      aria-label={vendor.name}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-4">
        <VendorImage
          src={vendor.logo125Url}
          alt={`${vendor.name} — kink vendor and BDSM gear`}
          size={125}
          className="shrink-0 sm:mx-0"
        />

        <div className="min-w-0 flex-1 w-full text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-serif font-semibold text-white line-clamp-1">
              {vendor.name}
            </h3>
            {vendor.isPaid ? (
              <span className="vendor-supporter-badge" aria-label="Supporter vendor">
                Supporter
              </span>
            ) : null}
          </div>

          {vendor.location ? (
            <p className="text-xs text-gray-400 mb-3">
              {vendor.location}
            </p>
          ) : null}

          {preview ? (
            <p className="text-sm text-gray-400 leading-relaxed">
              {preview}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-start">
            {vendor.websiteUrl ? (
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex min-h-touch w-full sm:w-auto items-center justify-center px-4 py-2 text-sm"
                aria-label={`Visit ${vendor.name} shop (opens in a new tab)`}
              >
                Visit Shop
              </a>
            ) : (
              <Link href={`/vendors/${vendor.slug}`} className="btn-primary inline-flex min-h-touch w-full sm:w-auto items-center justify-center px-4 py-2 text-sm">
                View Vendor
              </Link>
            )}

            <Link href={`/vendors/${vendor.slug}`} className="btn-outline inline-flex min-h-touch w-full sm:w-auto items-center justify-center px-4 py-2 text-sm">
              Details
            </Link>
          </div>
        </div>

        {/* Paid-only product image (125x125), switches by selected tag */}
        {vendor.isPaid ? (
          <div className="hidden lg:block flex-shrink-0">
            <VendorImage
              src={paidImageUrl}
              alt={`Featured product image for ${vendor.name}`}
              size={125}
            />
          </div>
        ) : null}
      </div>

      {/* Mobile paid image slot */}
      {vendor.isPaid ? (
        <div className="mt-5 lg:hidden">
          <div className="text-xs text-gray-500 mb-2">Supporter highlight</div>
          <VendorImage
            src={paidImageUrl}
            alt={`Featured product image for ${vendor.name}`}
            size={125}
          />
        </div>
      ) : null}
    </article>
  )
}

