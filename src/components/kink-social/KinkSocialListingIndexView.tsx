import Link from 'next/link'
import type { KinkSocialListingRecord } from '@/lib/unifiedExtendedListings'

const EMPTY_STATE =
  'No public listings have been published here yet. Listings appear here when organizers publish them from kink.social.'

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
              return (
                <li key={listing.slug}>
                  <Link
                    href={href}
                    className="group block rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 hover:border-teal-500/40 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-medium text-white group-hover:text-teal-100 transition-colors">
                          {listing.name}
                        </h2>
                        {listing.description ?
                          <p className="mt-2 line-clamp-2 text-sm text-gray-400">{listing.description}</p>
                        : null}
                        {location ?
                          <p className="mt-2 text-sm text-gray-500">{location}</p>
                        : null}
                      </div>
                      <span className="shrink-0 text-sm font-medium text-teal-300 group-hover:text-teal-200">
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
