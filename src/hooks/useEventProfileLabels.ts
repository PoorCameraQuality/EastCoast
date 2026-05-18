'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import {
  labelFor,
  parseEventProfile,
  type EventProfileId,
  type EventProfileLabelKey,
} from '@/lib/dancecard/eventProfile'

export type EventProfileLabels = Record<EventProfileLabelKey, string>

export function useEventProfileLabels(opts: {
  eventSlug: string
  source: 'organizer' | 'public'
  /** When set (e.g. from shell bootstrap), skips GET /event on the program tab. */
  eventProfile?: string | null
}) {
  const { eventSlug, source, eventProfile: eventProfileProp } = opts
  const slug = eventSlug.toLowerCase()
  const [profile, setProfile] = useState<EventProfileId>(() =>
    eventProfileProp != null && eventProfileProp !== ''
      ? parseEventProfile(eventProfileProp)
      : 'camp',
  )
  const [loading, setLoading] = useState(() => eventProfileProp == null || eventProfileProp === '')
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    setLoading(true)
    try {
      if (source === 'organizer') {
        if (eventProfileProp != null && eventProfileProp !== '') {
          setProfile(parseEventProfile(eventProfileProp))
        } else {
          const res = await organizerDancecardFetch<{ event: { eventProfile?: string } }>(slug, '/event')
          setProfile(parseEventProfile(res.event?.eventProfile))
        }
      } else {
        const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/attendee-guide`)
        const j = (await res.json()) as { eventProfile?: string; error?: string }
        if (!res.ok) throw new Error(j.error ?? 'Could not load profile')
        setProfile(parseEventProfile(j.eventProfile))
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
      setProfile('camp')
    } finally {
      setLoading(false)
    }
  }, [slug, source, eventProfileProp])

  useEffect(() => {
    if (source === 'organizer' && eventProfileProp != null && eventProfileProp !== '') {
      setProfile(parseEventProfile(eventProfileProp))
      setLoading(false)
      return
    }
    void load()
  }, [load, source, eventProfileProp])

  const labels = useMemo<EventProfileLabels>(
    () => ({
      scheduledItem: labelFor(profile, 'scheduledItem'),
      scheduledItemPlural: labelFor(profile, 'scheduledItemPlural'),
      leadPerson: labelFor(profile, 'leadPerson'),
      space: labelFor(profile, 'space'),
      volunteerBlock: labelFor(profile, 'volunteerBlock'),
      addItemCta: labelFor(profile, 'addItemCta'),
    }),
    [profile],
  )

  return { profile, labels, loading, err, reload: load }
}
