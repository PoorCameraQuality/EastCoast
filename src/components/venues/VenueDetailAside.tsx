import type { ReactNode } from 'react'
import Link from 'next/link'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { formatVenueHours } from '@/lib/formatVenueHours'
import VenueSocialLinks from '@/components/venues/VenueSocialLinks'

type Location = { city: string; state: string; address?: string }
type Contact = { phone?: string; email?: string }

type Props = {
  name: string
  slug: string
  entityType: 'dungeon' | 'swingClub'
  location: Location
  contact?: Contact
  hours?: string
  socialMedia?: Record<string, string | undefined>
  website?: string
  shopUrl?: string
  vendorListingSlug?: string
  /** Extra blocks (swing club practical details, etc.) */
  children?: ReactNode
}

export default function VenueDetailAside({
  name,
  slug,
  entityType,
  location,
  contact,
  hours,
  socialMedia,
  website,
  shopUrl,
  vendorListingSlug,
  children,
}: Props) {
  const mapsQuery = encodeURIComponent(
    location.address || `${location.city}, ${location.state}`
  )

  return (
    <aside className="card-glass space-y-5 p-4 sm:p-6">
      <div className="card-glass-wash" aria-hidden />

      <div className="relative z-10 space-y-5">
        {website ? (
          <OutboundWebsiteLink
            href={website}
            entityType={entityType}
            entitySlug={slug}
            entityName={name}
            className="btn-primary inline-flex min-h-touch w-full items-center justify-center px-4 py-2.5 text-sm"
            aria-label={`Visit ${name} website (opens in a new tab)`}
          >
            Visit website
          </OutboundWebsiteLink>
        ) : null}

        {children}

        <div>
          <h3 className="text-sm font-semibold text-white">Location</h3>
          <p className="mt-1 text-sm text-gray-300">
            {location.city}, {location.state}
          </p>
          {location.address ? (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{location.address}</p>
          ) : null}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-touch items-center text-sm text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline"
          >
            Open in Maps
          </a>
        </div>

        {contact?.phone || contact?.email ? (
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            {contact.phone ? (
              <a
                href={`tel:${contact.phone.replace(/\D/g, '')}`}
                className="mt-1 inline-flex min-h-touch items-center text-sm text-gray-300 hover:text-white"
                aria-label={`Call ${name}`}
              >
                {contact.phone}
              </a>
            ) : null}
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 inline-flex min-h-touch items-center break-all text-sm text-gray-300 hover:text-white"
                aria-label={`Email ${name}`}
              >
                {contact.email}
              </a>
            ) : null}
          </div>
        ) : null}

        {hours ? (
          <div>
            <h3 className="text-sm font-semibold text-white">Hours</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-300">{formatVenueHours(hours)}</p>
          </div>
        ) : null}

        <VenueSocialLinks name={name} socialMedia={socialMedia} />

        {shopUrl ? (
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex min-h-touch w-full items-center justify-center px-4 py-2 text-sm"
            aria-label={`Official shop for ${name} (opens in a new tab)`}
          >
            Merch shop
          </a>
        ) : null}

        {vendorListingSlug ? (
          <Link
            href={`/vendors/${vendorListingSlug}`}
            className="inline-flex min-h-touch w-full items-center justify-center rounded-xl border border-primary-500/40 bg-primary-500/10 px-4 py-2 text-sm text-primary-200 transition hover:bg-primary-500/20"
          >
            Vendor profile
          </Link>
        ) : null}

        <Link
          href="/contact"
          className="btn-outline inline-flex min-h-touch w-full items-center justify-center px-4 py-2 text-sm"
        >
          Suggest an edit
        </Link>
      </div>
    </aside>
  )
}
