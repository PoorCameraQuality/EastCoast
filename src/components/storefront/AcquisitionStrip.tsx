import Link from 'next/link'
import { getKinkSocialOrgUrl, KINK_SOCIAL_LABELS } from '@/lib/kinkSocialMarketing'

export default function AcquisitionStrip() {
  return (
    <div
      className="border-b border-sf-gold/10 bg-sf-surface/80"
      role="region"
      aria-label="Product announcement"
    >
      <div className="container-custom flex flex-col items-center justify-center gap-2 px-4 py-2.5 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-sf-muted sm:text-sm">
          <span className="text-sf-body">Public guide by kink.social</span>
          <span className="mx-2 inline-block h-1 w-1 rounded-full bg-sf-gold/60 align-middle" aria-hidden />
          <span>Events, places, vendors, education, and organizer publishing</span>
        </p>
        <Link
          href={getKinkSocialOrgUrl('home_platform')}
          className="shrink-0 text-xs font-medium text-sf-gold transition-colors hover:text-sf-strong sm:text-sm"
        >
          {KINK_SOCIAL_LABELS.publishToEcke} →
        </Link>
      </div>
    </div>
  )
}
