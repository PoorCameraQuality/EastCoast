'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { DEEP_GUIDE_TABS, type DeepGuideParam } from '@/lib/dancecard/guides/guideKeys'
import type { OrganizerTab } from '@/components/dancecard/organizer/shell/organizerNavConfig'

const VALID_GUIDES = new Set<string>(['registration', 'program', 'vetting', 'integrations', 'conflicts'])

function isDeepGuide(v: string | null): v is DeepGuideParam {
  return v !== null && VALID_GUIDES.has(v)
}

export function GuideRouter({
  eventSlug,
  onSwitchTab,
  onGuideAcknowledged,
}: {
  eventSlug: string
  onSwitchTab: (tab: OrganizerTab, opts?: { guide?: DeepGuideParam }) => void
  onGuideAcknowledged?: (guide: DeepGuideParam) => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const g = searchParams.get('guide')
    if (!isDeepGuide(g)) return
    const tab = DEEP_GUIDE_TABS[g]
    onSwitchTab(tab, { guide: g })
    onGuideAcknowledged?.(g)

    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    params.delete('guide')
    const qs = params.toString()
    const path = `/organizer/dancecard/${eventSlug.toLowerCase()}`
    window.history.replaceState(null, '', qs ? `${path}?${qs}` : path)
  }, [searchParams, eventSlug, onSwitchTab, onGuideAcknowledged])

  return null
}
