import Image from 'next/image'
import Link from 'next/link'
import {
  listingImageAlt,
  listingImageUnoptimized,
  usableListingImageUrl,
} from '@/lib/eckeOrgCatalog'
import { listingCopyToPlainText } from '@/lib/eckeOrgRichText'
import type { KinkSocialListingRecord } from '@/lib/unifiedExtendedListings'

const EMPTY_STATE =
  'No public listings have been published here yet. They appear when organizers publish them from an ECKE organization account.'

type Props = {
  title: string
  description: string
  indexHref: string
  listings: KinkSocialListingRecord[]
}

function listingLocation(listing: KinkSocialListingRecord): string | null {
  const parts = [listing.publicLocationSummary, listing.city, listing.state].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}

function ListingCardMedia({ listing }: { listing: KinkSocialListingRecord }) {
  const imageUrl = usableListingImageUrl(listing.logoUrl) ?? usableListingImageUrl(listing.gallery?.[0]?.publicUrl)
  if (imageUrl) {
    const kind = usableListingImageUrl(listing.logoUrl) ? 'logo' : 'image'
    return (
      <Image
        src={imageUrl}
        alt={listingImageAlt(listing.name, kind)}
        width={56}
        height={56}
        className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-white/5 object-cover sm:h-14 sm:w-14"
        unoptimized={listingImageUnoptimized(imageUrl)}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-semibold uppercase tracking-wide text-gray-500 sm:h-14 sm:w-14"
    >
      {(listing.name.trim()[0] || '·')}
    </span>
  )
}

export default function KinkSocialListingIndexView({ title, description, indexHref, listings }: Props) {
  return (
    <main className="min-h-screen bg-black section-padding">
      <div className="container-custom max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-white">{title}</h1>
        <p className="mt-3 text-gray-400">{description}</p>

        {listings.length === 0 ?
          <p className="mt-8 text-sm text-gray-500">{EMPTY_STATE}</p>
        : (
          <ul className="mt-8 space-y-4">
            {listings.map((listing) => {
              const href = `${indexHref}/${listing.slug}`
              const location = listingLocation(listing)
              const blurb = listingCopyToPlainText(listing.description)
              return (
                <li key={listing.slug}>
                  <Link
                    href={href}
                    className="group block rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-teal-500/40 transition"
                  >
                    <div className="flex flex-wrap items-start gap-3 sm:gap-4">
                      <ListingCardMedia listing={listing} />
                      <div className="min-w-0 flex-1">
                        <h2 className="font-medium text-white group-hover:text-teal-100 transition-colors">
                          {listing.name}
                        </h2>
                        {blurb ?
                          <p className="mt-2 line-clamp-2 text-sm text-gray-400">{blurb}</p>
                        : null}
                        {location ?
                          <p className="mt-2 text-sm text-gray-500">{location}</p>
                        : null}
                      </div>
                      <span className="shrink-0 self-center text-sm font-medium text-teal-300 group-hover:text-teal-200">
                        View listing →
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
