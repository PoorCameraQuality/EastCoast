'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDancecardAppearance } from '@/components/dancecard/DancecardAppearanceContext'
import DancecardAppearancePicker from '@/components/dancecard/DancecardAppearancePicker'

type HubEvent = {
  slug: string
  eventTitle: string
  productTitle: string
  status: string
  role: string
  updatedAt: string
}

export function OrganizerDancecardChrome({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const { appearanceId, appearanceStyle, appearanceReady } = useDancecardAppearance()
  const [events, setEvents] = useState<HubEvent[] | null>(null)
  const slugMatch = pathname?.match(/^\/organizer\/dancecard\/([^/]+)/)
  const currentSlug = slugMatch && slugMatch[1] !== '' ? slugMatch[1].toLowerCase() : null
  const isHubHome = pathname === '/organizer/dancecard' || pathname === '/organizer/dancecard/'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/organizer/dancecard/events', { credentials: 'include' })
        if (!res.ok) return
        const j = (await res.json()) as { events: HubEvent[] }
        if (!cancelled) setEvents(j.events ?? [])
      } catch {
        if (!cancelled) setEvents([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className={`dc-gold-chrome min-h-screen bg-dc-surface text-dc-text ${className}`.trim()}
      data-dc-theme="event"
      data-dc-appearance={appearanceId}
      style={appearanceReady ? appearanceStyle : undefined}
      suppressHydrationWarning
    >
      <header className="z-dc-chrome border-b border-dc-border bg-dc-surface-muted/80 px-4 py-3">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-sm font-medium text-dc-accent hover:text-dc-accent-hover">
              East Coast Kink Events
            </Link>
            <Link
              href="/organizer/dancecard"
              className={
                isHubHome
                  ? 'text-sm font-medium text-dc-text'
                  : 'text-sm text-dc-muted hover:text-dc-text'
              }
            >
              Organizer home
            </Link>
            {!isHubHome ? (
              <span className="text-sm text-dc-muted" aria-hidden>
                /
              </span>
            ) : null}
            {!isHubHome ? <span className="text-sm text-dc-muted">Event workspace</span> : null}
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3 sm:flex-none">
            <DancecardAppearancePicker compact className="shrink-0" />
            {currentSlug && events && events.length > 0 ? (
              <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-dc-text sm:max-w-[16rem] sm:flex-none">
                <span className="shrink-0 text-dc-micro uppercase tracking-wide text-dc-muted">Switch</span>
                <select
                  className="min-w-0 flex-1 max-w-full truncate rounded-lg border border-dc-border bg-dc-elevated-solid px-2 py-1.5 text-sm text-dc-text"
                  value={currentSlug}
                  onChange={(e) => {
                    const next = e.target.value
                    if (next) window.location.href = `/organizer/dancecard/${encodeURIComponent(next)}`
                  }}
                >
                  {events.map((ev) => (
                    <option key={ev.slug} value={ev.slug} title={`${ev.eventTitle} (${ev.slug}) — ${ev.role}`}>
                      {ev.eventTitle}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
