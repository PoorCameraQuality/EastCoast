'use client'

import Link from 'next/link'
import VendorImage from '@/components/vendors/VendorImage'
import { getVendorBySlug } from '@/data/vendors'

type Props = {
  contextLabel: string
}

export default function SupportCTAInline({ contextLabel }: Props) {
  const sponsorVendor = getVendorBySlug('floggin-farmers')
  const wrapperClassName = sponsorVendor
    ? 'mt-6 mb-8'
    : 'mt-6 mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 via-white/4 to-transparent backdrop-blur-xl p-5 md:p-6'

  return (
    <aside
      className={wrapperClassName}
      aria-label="Support this site"
    >
      <div className="flex flex-col gap-4">
        {sponsorVendor ? (
          <div className="relative overflow-visible rounded-2xl border border-amber-300/40 bg-black/70 p-4 vendor-sponsor-glitter">
            <span className="sponsor-spotlight-label">
              Keep this site community funded
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <VendorImage
                src={sponsorVendor.logo125Url}
                alt={`${sponsorVendor.name} logo`}
                size={48}
                className="flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-200/90">
                  Sponsor spotlight
                </p>
                <p className="text-lg font-serif font-semibold text-white mt-1">
                  <Link href={`/vendors/${sponsorVendor.slug}`} className="underline underline-offset-4 decoration-amber-200/40 hover:decoration-amber-200/80">
                    {sponsorVendor.name}
                  </Link>
                </p>
                <p className="text-sm text-gray-200 mt-1">
                  Sponsor for February: Floggin Farmers.
                </p>
                {sponsorVendor.description ? (
                  <p className="text-xs text-gray-300 mt-2">
                    {sponsorVendor.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/vendors/${sponsorVendor.slug}`} className="btn-primary px-3 py-1.5 text-xs">
                    View Sponsor
                  </Link>
                  {sponsorVendor.websiteUrl ? (
                    <a
                      href={sponsorVendor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Visit Shop
                    </a>
                  ) : null}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Sponsorship details via Discord: <span className="text-gray-200 font-semibold">Brax117</span>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {!sponsorVendor ? (
        <p className="text-xs text-gray-400 mt-3">
          Sponsorship details via Discord: <span className="text-gray-200 font-semibold">Brax117</span>
        </p>
      ) : null}
    </aside>
  )
}

