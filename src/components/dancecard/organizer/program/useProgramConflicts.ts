'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import type { DancecardConflict } from '@/lib/dancecard/conflictScanner'

export function useProgramConflicts(eventSlug: string) {
  const [conflicts, setConflicts] = useState<DancecardConflict[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await organizerDancecardFetch<{ conflicts: DancecardConflict[] }>(
        eventSlug,
        '/program-conflicts',
      )
      setConflicts(res.conflicts ?? [])
    } catch {
      setConflicts([])
    } finally {
      setLoading(false)
    }
  }, [eventSlug])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { conflicts, loading, refresh }
}
