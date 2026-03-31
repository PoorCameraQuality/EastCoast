'use client'

import Link from 'next/link'
import type { AnalyticsEntityType } from '@/lib/analyticsEntities'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'

type Props = {
  href: string
  entityType: AnalyticsEntityType
  slug: string
  name: string
  itemListName: string
  className?: string
  'aria-label'?: string
  children: React.ReactNode
}

export default function TrackedEntityLink({
  href,
  entityType,
  slug,
  name,
  itemListName,
  className,
  'aria-label': ariaLabel,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() =>
        trackSelectItemEntity({
          entityType,
          slug,
          name,
          itemListName,
        })
      }
    >
      {children}
    </Link>
  )
}
