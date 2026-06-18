'use client'

import KinkSocialAcquisitionCard from '@/components/kink-social/KinkSocialAcquisitionCard'

type KinkSocialOrganizerCtaProps = {
  compact?: boolean
  className?: string
}

export default function KinkSocialOrganizerCta({ compact = false, className = '' }: KinkSocialOrganizerCtaProps) {
  return <KinkSocialAcquisitionCard variant="organizer" compact={compact} className={className} />
}
