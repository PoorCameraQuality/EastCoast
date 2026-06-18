'use client'

import {
  KINK_SOCIAL_PLATFORM_FAQ,
  getAcquisitionCopy,
  type KinkSocialAcquisitionVariant,
} from '@/lib/kinkSocialMarketing'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'

type KinkSocialAcquisitionCardProps = {
  variant: KinkSocialAcquisitionVariant
  compact?: boolean
  eventSlug?: string
  organizerName?: string
  stateName?: string
  safeKinkSocialEventUrl?: string | null
  className?: string
}

export default function KinkSocialAcquisitionCard({
  variant,
  compact = false,
  eventSlug,
  organizerName,
  stateName,
  safeKinkSocialEventUrl,
  className = '',
}: KinkSocialAcquisitionCardProps) {
  const copy = getAcquisitionCopy(variant, {
    eventSlug,
    organizerName,
    stateName,
    safeKinkSocialEventUrl,
  })
  const surface = `acquisition_${variant}`
  const headingId = `ks-acq-${variant}${eventSlug ? `-${eventSlug}` : ''}`

  const panelClass = compact
    ? 'p-4 sm:p-5'
    : 'p-5 sm:p-6 md:p-8'
  const headingClass = compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/35 via-[#0a1018] to-black/90 shadow-[0_0_32px_rgba(20,184,166,0.08)] ${panelClass} ${className}`}
      aria-labelledby={headingId}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300/90 sm:text-xs">
          {copy.eyebrow}
        </p>
        <h2 id={headingId} className={`mt-3 font-serif font-bold leading-tight text-white ${headingClass}`}>
          {copy.heading}
        </h2>
        <p className={`mt-3 leading-relaxed text-gray-300 ${compact ? 'text-sm' : 'text-base'}`}>
          {copy.body}
        </p>

        {copy.bullets.length > 0 ? (
          <ul className={`mt-4 space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {copy.bullets.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-300">
                <span className="mt-0.5 shrink-0 font-bold text-teal-400" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={`mt-5 flex flex-col gap-2.5 ${compact ? '' : 'sm:flex-row sm:flex-wrap'}`}>
          <KinkSocialCtaLink
            href={copy.primaryHref}
            label={copy.primaryLabel}
            variant={variant}
            surface={surface}
            entitySlug={eventSlug}
            external={copy.primaryHref.startsWith('http')}
            className={`inline-flex min-h-touch items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 px-5 font-semibold text-white shadow-lg transition hover:from-teal-500 hover:to-teal-400 ${compact ? 'py-2.5 text-sm' : 'py-3 text-sm sm:text-base'}`}
          />
          <KinkSocialCtaLink
            href={copy.secondaryHref}
            label={copy.secondaryLabel}
            variant={variant}
            surface={surface}
            entitySlug={eventSlug}
            external={copy.secondaryHref.startsWith('http')}
            className={`inline-flex min-h-touch items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 font-semibold text-gray-100 transition hover:border-teal-400/40 hover:bg-white/10 ${compact ? 'py-2.5 text-sm' : 'py-3 text-sm'}`}
          />
        </div>

        {copy.tertiaryHref && copy.tertiaryLabel ? (
          <p className="mt-3">
            <KinkSocialCtaLink
              href={copy.tertiaryHref}
              label={copy.tertiaryLabel}
              variant={variant}
              surface={surface}
              entitySlug={eventSlug}
              external={copy.tertiaryHref.startsWith('http')}
              className="text-sm font-medium text-teal-300/90 underline-offset-2 hover:text-teal-200 hover:underline"
            />
          </p>
        ) : null}

        {copy.footnote ? (
          <p className={`mt-4 text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>{copy.footnote}</p>
        ) : null}

        {copy.showFaq ? (
          <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
            {KINK_SOCIAL_PLATFORM_FAQ.map((item) => (
              <details
                key={item.question}
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 open:bg-black/30"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-gray-200 [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="mt-2 border-t border-white/10 pt-2 text-sm leading-relaxed text-gray-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
