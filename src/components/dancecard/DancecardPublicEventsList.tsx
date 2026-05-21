'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { PublicDancecardEvent } from '@/lib/dancecard/publicEvents'
import { DANCECARD_ATTENDEE_SANDBOX_PATH } from '@/lib/dancecard/nav'

export function DancecardPublicEventsList() {
  const [events, setEvents] = useState<PublicDancecardEvent[] | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/dancecard/public-events', { cache: 'no-store' })
        if (!res.ok) {
          if (!cancelled) setLoadErr('Could not load events right now.')
          return
        }
        const j = (await res.json()) as { events?: PublicDancecardEvent[] }
        if (!cancelled) {
          setEvents(j.events ?? [])
          setLoadErr(null)
        }
      } catch {
        if (!cancelled) setLoadErr('Could not load events right now.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (events === null && !loadErr) {
    return <p className="text-sm text-dc-muted">Loading events…</p>
  }

  if (loadErr) {
    return (
      <p className="text-sm text-dc-muted">
        {loadErr}{' '}
        <Link href={DANCECARD_ATTENDEE_SANDBOX_PATH} className="text-dc-accent underline hover:text-dc-accent-hover">
          attendee sandbox demo
        </Link>
      </p>
    )
  }

  if (!events?.length) {
    return (
      <p className="text-sm text-dc-muted">
        No published events yet. Try the{' '}
        <Link href={DANCECARD_ATTENDEE_SANDBOX_PATH} className="text-dc-accent underline hover:text-dc-accent-hover">
          attendee sandbox demo
        </Link>{' '}
        instead. No event code needed.
      </p>
    )
  }

  return (
    <ul className="space-y-2" role="list">
      {events.map((ev) => (
        <li key={ev.slug}>
          <Link
            href={`/dancecard/${encodeURIComponent(ev.slug)}`}
            className="flex min-h-touch flex-col rounded-xl border border-dc-border bg-dc-elevated-muted/50 px-4 py-3 transition hover:border-dc-accent-border hover:bg-dc-elevated-solid/80 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium text-dc-text">{ev.eventTitle}</span>
            <span className="text-xs text-dc-muted sm:text-right">
              <span className="font-mono text-dc-accent/90">{ev.slug}</span>
              {ev.timezone ? <span className="ml-2 text-dc-muted">{ev.timezone}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
