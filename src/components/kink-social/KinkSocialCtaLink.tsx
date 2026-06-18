'use client'

import Link from 'next/link'
import { useGA4 } from '@/contexts/GA4Provider'
import {
  KINK_SOCIAL_CTA_ANALYTICS_EVENT,
  campaignForVariant,
  type KinkSocialAcquisitionVariant,
} from '@/lib/kinkSocialMarketing'

type KinkSocialCtaLinkProps = {
  href: string
  label: string
  variant: KinkSocialAcquisitionVariant
  surface: string
  className?: string
  entitySlug?: string
  external?: boolean
}

export default function KinkSocialCtaLink({
  href,
  label,
  variant,
  surface,
  className = '',
  entitySlug,
  external = href.startsWith('http'),
}: KinkSocialCtaLinkProps) {
  const { trackCustomEvent } = useGA4()

  const onClick = () => {
    trackCustomEvent(KINK_SOCIAL_CTA_ANALYTICS_EVENT, {
      surface,
      variant,
      destination: href,
      ctaLabel: label,
      campaign: campaignForVariant(variant),
      ...(entitySlug ? { entitySlug } : {}),
    })
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  )
}
