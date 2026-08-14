'use client'

import type { AnalyticsEntityType } from '@/lib/analyticsEntities'
import { trackOutboundEntityClick } from '@/lib/analyticsEntities'

type Props = {
  href: string
  entityType: AnalyticsEntityType
  entitySlug: string
  entityName: string
  organizerName?: string | null
  organizerSlug?: string | null
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}

export default function OutboundWebsiteLink({
  href,
  entityType,
  entitySlug,
  entityName,
  organizerName,
  organizerSlug,
  className,
  children,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={() =>
        trackOutboundEntityClick({
          entityType,
          slug: entitySlug,
          name: entityName,
          url: href,
          organizerName,
          organizerSlug,
        })
      }
    >
      {children}
    </a>
  )
}
