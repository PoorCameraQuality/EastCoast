'use client'

import { getAcquisitionCopy, type KinkSocialAcquisitionVariant } from '@/lib/kinkSocialMarketing'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'

type KinkSocialInlineCtaProps = {
  variant: KinkSocialAcquisitionVariant
  stateName?: string
  className?: string
}

/** Compact inline strip for tight layouts (footer bands, secondary columns). */
export default function KinkSocialInlineCta({ variant, stateName, className = '' }: KinkSocialInlineCtaProps) {
  const copy = getAcquisitionCopy(variant, { stateName })
  const surface = `inline_${variant}`

  return (
    <aside
      className={`rounded-xl border border-teal-500/20 bg-teal-950/15 p-4 sm:p-5 ${className}`}
      aria-label="kink.social community platform"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300/80">{copy.eyebrow}</p>
      <p className="mt-2 text-sm font-medium text-white">{copy.heading}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{copy.body}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <KinkSocialCtaLink
          href={copy.primaryHref}
          label={copy.primaryLabel}
          variant={variant}
          surface={surface}
          external={copy.primaryHref.startsWith('http')}
          className="inline-flex min-h-touch items-center justify-center rounded-lg bg-teal-600/90 px-4 text-sm font-semibold text-white hover:bg-teal-500"
        />
        <KinkSocialCtaLink
          href={copy.secondaryHref}
          label={copy.secondaryLabel}
          variant={variant}
          surface={surface}
          external={copy.secondaryHref.startsWith('http')}
          className="inline-flex min-h-touch items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-medium text-gray-200 hover:border-teal-400/30"
        />
      </div>
    </aside>
  )
}
