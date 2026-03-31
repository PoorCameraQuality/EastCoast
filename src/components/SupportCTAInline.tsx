'use client'

import Link from 'next/link'
import VendorImage from '@/components/vendors/VendorImage'
import { getSiteSponsorVendor } from '@/data/vendors'

const SPONSOR_CONTACT_HREF =
  '/contact?subject=Website%20Sponsorship%20(Discord%20Brax117)'

type Props = {
  contextLabel: string
  /** Full-width below hero (default) vs compact column beside hero on large screens */
  variant?: 'stack' | 'heroAside'
}

export default function SupportCTAInline({ contextLabel, variant = 'stack' }: Props) {
  const sponsorVendor = getSiteSponsorVendor()
  const isAside = variant === 'heroAside'

  const wrapperClassName = sponsorVendor
    ? isAside
      ? 'mt-0 mb-0 w-full max-w-md mx-auto lg:mx-0 lg:max-w-none'
      : 'mt-4 mb-6'
    : isAside
      ? 'mt-0 mb-0 w-full max-w-md mx-auto lg:mx-0 lg:max-w-none rounded-xl border border-white/10 bg-gradient-to-br from-white/6 via-white/4 to-transparent backdrop-blur-xl p-3 sm:p-4'
      : 'mt-4 mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/6 via-white/4 to-transparent backdrop-blur-xl p-4 md:p-5'

  return (
    <aside
      className={wrapperClassName}
      aria-label={`Support this site — ${contextLabel}`}
    >
      <div className={`flex flex-col ${isAside ? 'gap-3' : 'gap-4'}`}>
        {sponsorVendor ? (
          <div
            className={`relative overflow-visible rounded-xl border border-amber-300/40 bg-black/70 vendor-sponsor-glitter ${
              isAside ? 'p-3' : 'p-3 sm:p-4'
            }`}
          >
            <span className="sponsor-spotlight-label">
              Keep this site community funded
            </span>
            <div
              className={
                isAside
                  ? 'flex flex-col items-stretch gap-3'
                  : 'flex flex-col gap-4 sm:flex-row sm:items-center'
              }
            >
              <VendorImage
                src={sponsorVendor.logo125Url}
                alt={`${sponsorVendor.name} logo`}
                size={isAside ? 40 : 48}
                className="flex-shrink-0 self-start"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/90 sm:text-xs sm:tracking-[0.2em]">
                  Sponsor spotlight
                </p>
                <p
                  className={`font-serif font-semibold text-white mt-1 ${isAside ? 'text-base leading-snug' : 'text-lg'}`}
                >
                  <Link
                    href={`/vendors/${sponsorVendor.slug}`}
                    className="underline underline-offset-4 decoration-amber-200/40 hover:decoration-amber-200/80"
                  >
                    {sponsorVendor.name}
                  </Link>
                </p>
                <p className={`text-gray-200 mt-1 ${isAside ? 'text-xs' : 'text-sm'}`}>
                  Featured site sponsor.
                </p>
                {sponsorVendor.description ? (
                  <p
                    className={`text-gray-300 mt-2 ${isAside ? 'text-[11px] leading-relaxed line-clamp-4' : 'text-xs'}`}
                  >
                    {sponsorVendor.description}
                  </p>
                ) : null}
                <div
                  className={`mt-3 flex gap-2 ${isAside ? 'flex-col' : 'flex-col sm:flex-row flex-wrap'}`}
                >
                  <Link
                    href={`/vendors/${sponsorVendor.slug}`}
                    className="btn-primary px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center w-full sm:w-auto"
                  >
                    View Sponsor
                  </Link>
                  {sponsorVendor.websiteUrl ? (
                    <a
                      href={sponsorVendor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center w-full sm:w-auto"
                    >
                      Visit Shop
                    </a>
                  ) : null}
                </div>
                <p className={`text-gray-400 mt-2 ${isAside ? 'text-[10px] leading-snug' : 'text-xs'}`}>
                  Sponsorship via Discord: <span className="text-gray-200 font-semibold">Brax117</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col ${isAside ? 'gap-2' : 'gap-3'}`}>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Community funded
              </p>
              <h3
                className={`font-serif font-semibold text-white mt-1 ${isAside ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}
              >
                Sponsor this site
              </h3>
              <p
                className={`text-gray-300 mt-2 leading-relaxed ${isAside ? 'text-xs line-clamp-5' : 'text-sm'}`}
              >
                Website sponsorship includes the Supporter tier plus highly visible placement for your brand or project.
                Help keep East Coast Kink Events online and improving.
              </p>
            </div>
            <div className={`flex gap-2 ${isAside ? 'flex-col' : 'flex-col sm:flex-row flex-wrap'}`}>
              <Link
                href="/support"
                className="btn-primary px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center w-full sm:w-auto"
              >
                Learn more
              </Link>
              <Link
                href={SPONSOR_CONTACT_HREF}
                className="btn-outline px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center w-full sm:w-auto"
              >
                Contact for sponsorship
              </Link>
            </div>
            <p className={`text-gray-400 ${isAside ? 'text-[10px]' : 'text-xs'}`}>
              Sponsorship via Discord: <span className="text-gray-200 font-semibold">Brax117</span>
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
