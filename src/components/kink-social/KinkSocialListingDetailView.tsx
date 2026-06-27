import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import KinkSocialAcquisitionCard from '@/components/kink-social/KinkSocialAcquisitionCard'
import KinkSocialEntityGallerySection from '@/components/kink-social/KinkSocialEntityGallerySection'
import type { KinkSocialListingRecord } from '@/lib/unifiedExtendedListings'

type Props = {
  entityLabel: string
  indexHref: string
  indexLabel: string
  listing: KinkSocialListingRecord
}

export default function KinkSocialListingDetailView({ entityLabel, indexHref, indexLabel, listing }: Props) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: indexLabel, href: indexHref },
    { label: listing.name, href: `${indexHref}/${listing.slug}`, current: true },
  ]

  const locationParts = [listing.publicLocationSummary, listing.city, listing.state].filter(Boolean)

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
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
              {entityLabel} · Published from kink.social
            </p>
            <div className="mt-3 flex flex-wrap items-start gap-4 sm:gap-6">
              {listing.logoUrl ?
                <img
                  src={listing.logoUrl}
                  alt={`${listing.name} image`}
                  className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5 object-cover sm:h-20 sm:w-20"
                />
              : null}
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">{listing.name}</h1>
                {listing.orgDisplayName ?
                  <p className="mt-2 text-sm text-gray-400">Part of {listing.orgDisplayName}</p>
                : null}
              </div>
            </div>
            {locationParts.length ?
              <p className="mt-4 text-gray-300">{locationParts.join(' · ')}</p>
            : null}
            {listing.description ?
              <p className="mt-6 text-gray-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            : null}
            {listing.websiteUrl ?
              <a
                href={listing.websiteUrl}
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
              className="mt-8 rounded-xl border border-teal-500/25 bg-teal-950/20 p-5 sm:p-6"
              aria-label="kink.social source attribution"
            >
              <p className="text-sm font-medium text-teal-200/90">Published from kink.social.</p>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                Manage or update this listing on kink.social.
              </p>
              <a
                href={listing.kinkSocialCanonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-touch items-center rounded-lg border border-teal-500/40 px-4 text-sm font-medium text-teal-200 hover:bg-teal-500/10 transition"
              >
                View on kink.social
              </a>
            </aside>
          : null}

          <div className="mt-10">
            <KinkSocialAcquisitionCard variant="eventsIndex" compact />
          </div>
        </div>
      </div>
    </section>
  )
}
