import Image from 'next/image'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import KinkSocialEntityGallerySection from '@/components/kink-social/KinkSocialEntityGallerySection'
import EntityPageViewTracker from '@/components/analytics/EntityPageViewTracker'
import type { AnalyticsEntityType } from '@/lib/analyticsEntities'
import {
  isRedundantOrgDisplayName,
  listingImageAlt,
  listingImageUnoptimized,
  usableListingImageUrl,
} from '@/lib/eckeOrgCatalog'
import { listingCopyToSafeHtml } from '@/lib/eckeOrgRichText'
import type { KinkSocialListingRecord } from '@/lib/unifiedExtendedListings'

type Props = {
  entityLabel: string
  indexHref: string
  indexLabel: string
  listing: KinkSocialListingRecord
  analyticsEntityType?: AnalyticsEntityType
}

export default function KinkSocialListingDetailView({
  entityLabel,
  indexHref,
  indexLabel,
  listing,
  analyticsEntityType = 'organization',
}: Props) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: indexLabel, href: indexHref },
    { label: listing.name, href: `${indexHref}/${listing.slug}`, current: true },
  ]

  const locationParts = [listing.publicLocationSummary, listing.city, listing.state].filter(Boolean)
  const logoUrl = usableListingImageUrl(listing.logoUrl)
  const descriptionHtml = listingCopyToSafeHtml(listing.description)
  const showPartOf =
    Boolean(listing.orgDisplayName) &&
    !isRedundantOrgDisplayName(listing.orgDisplayName, listing.name)

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
      <EntityPageViewTracker
        entityType={analyticsEntityType}
        slug={listing.slug}
        name={listing.name}
        organizerName={listing.orgDisplayName || listing.name}
        organizerSlug={listing.orgSlug || listing.slug}
        pagePath={`${indexHref}/${listing.slug}`}
      />
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <Link
              href={indexHref}
              className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              ← {indexLabel}
            </Link>
          </div>

          <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-8 shadow-dark">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300/90 sm:text-xs">
              {entityLabel}
            </p>
            <div className="mt-3 flex flex-wrap items-start gap-4 sm:gap-6">
              {logoUrl ?
                <Image
                  src={logoUrl}
                  alt={listingImageAlt(listing.name, 'logo')}
                  width={80}
                  height={80}
                  className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5 object-cover sm:h-20 sm:w-20"
                  unoptimized={listingImageUnoptimized(logoUrl)}
                />
              : null}
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">{listing.name}</h1>
                {showPartOf ?
                  <p className="mt-2 text-sm text-gray-400">Part of {listing.orgDisplayName}</p>
                : null}
              </div>
            </div>
            {locationParts.length ?
              <p className="mt-4 text-gray-300">{locationParts.join(' · ')}</p>
            : null}
            {descriptionHtml ?
              <div
                className="prose prose-invert mt-6 max-w-none text-gray-300"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            : null}
            {listing.relatedHref ?
              <Link
                href={listing.relatedHref}
                className="mt-4 inline-flex text-sm text-teal-200 hover:text-teal-100 underline"
              >
                {listing.relatedLabel || 'View listing'}
              </Link>
            : null}
            {listing.websiteUrl || listing.ctaUrl ?
              <a
                href={listing.websiteUrl || listing.ctaUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm text-teal-200 hover:text-teal-100 underline"
              >
                Visit website
              </a>
            : null}
          </header>

          {listing.gallery?.length ? (
            <KinkSocialEntityGallerySection gallery={listing.gallery} title="Photos" />
          ) : null}

          {listing.kinkSocialCanonicalUrl ?
            <aside
              className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
              aria-label="Source listing"
            >
              <p className="text-sm font-medium text-gray-200">Directory listing</p>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                Confirm details with the organizer. A source listing is available when you need the original page.
              </p>
              <a
                href={listing.kinkSocialCanonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-gray-200 hover:bg-white/10 transition"
              >
                View source listing
              </a>
            </aside>
          : null}
        </div>
      </div>
    </section>
  )
}
