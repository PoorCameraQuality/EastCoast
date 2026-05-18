'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ALL_PEOPLE_SUB_TABS,
  isPeopleSubTab,
  PEOPLE_SUB_TAB_PARAM,
  type PeopleSubTab,
} from '@/components/dancecard/organizer/shell/organizerNavConfig'

export function usePeopleSubTab(eventSlug: string, defaultTab: PeopleSubTab = 'signups') {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = eventSlug.toLowerCase()

  const peopleTab: PeopleSubTab = useMemo(() => {
    const raw = searchParams.get(PEOPLE_SUB_TAB_PARAM)
    if (isPeopleSubTab(raw)) return raw
    return defaultTab
  }, [searchParams, defaultTab])

  const setPeopleTab = useCallback(
    (next: PeopleSubTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'people')
      params.set(PEOPLE_SUB_TAB_PARAM, next)
      const href = `/organizer/dancecard/${slug}?${params.toString()}`
      router.replace(href, { scroll: false })
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', href)
      }
    },
    [router, searchParams, slug],
  )

  return { peopleTab, setPeopleTab, allTabs: ALL_PEOPLE_SUB_TABS }
}
