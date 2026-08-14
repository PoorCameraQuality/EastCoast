'use client'

import { useEffect, useRef } from 'react'
import {
  GA_CONSENT_EVENT,
  trackEntityPageView,
  type AnalyticsEntityType,
} from '@/lib/analyticsEntities'

type Props = {
  entityType: AnalyticsEntityType
  slug: string
  name: string
  organizerName?: string | null
  organizerSlug?: string | null
  pagePath?: string
}

/**
 * Sends enriched page_view + view_item once per mount (and again if consent arrives late).
 * Place on public listing detail pages so GA4 can report landings by entity / organizer.
 */
export default function EntityPageViewTracker({
  entityType,
  slug,
  name,
  organizerName,
  organizerSlug,
  pagePath,
}: Props) {
  const sentKey = useRef<string | null>(null)

  useEffect(() => {
    const key = `${entityType}:${slug}`
    const send = () => {
      if (sentKey.current === key) return
      if (typeof window === 'undefined' || !window.gaConsent || typeof window.gtag !== 'function') {
        return
      }
      trackEntityPageView({
        entityType,
        slug,
        name,
        organizerName,
        organizerSlug,
        pagePath,
      })
      sentKey.current = key
    }

    send()
    window.addEventListener(GA_CONSENT_EVENT, send)
    return () => window.removeEventListener(GA_CONSENT_EVENT, send)
  }, [entityType, slug, name, organizerName, organizerSlug, pagePath])

  return null
}
