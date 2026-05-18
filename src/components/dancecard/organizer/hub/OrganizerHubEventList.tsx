'use client'

import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import type { OrganizerHubEventWithStats } from '@/lib/dancecard/organizerHubStats'
import { cn } from '@/lib/cn'
import { hubNextStep, humanRole, programSummary } from '@/components/dancecard/organizer/hub/organizerHubCopy'

function statusLabel(status: string): { label: string; tone: 'live' | 'draft' | 'other' } {
  const s = status.toLowerCase()
  if (s === 'published') return { label: 'Live for attendees', tone: 'live' }
  if (s === 'draft') return { label: 'Draft (hidden)', tone: 'draft' }
  return { label: status, tone: 'other' }
}

function formatEventWindow(starts: string, ends: string, tz: string): string {
  try {
    const a = formatInTimeZone(starts, tz, 'EEEE, MMM d')
    const b = formatInTimeZone(ends, tz, 'EEEE, MMM d, yyyy')
    return `${a} through ${b}`
  } catch {
    return 'Event dates not set yet'
  }
}

export function OrganizerHubEventList({ events }: { events: OrganizerHubEventWithStats[] }) {
  if (events.length === 0) return null

  return (
    <ul className="space-y-4">
      {events.map((ev) => {
        const st = statusLabel(ev.status)
        const href = `/organizer/dancecard/${encodeURIComponent(ev.slug)}?tab=dashboard`
        const next = hubNextStep(ev)
        const attendeePreview = `/dancecard/${encodeURIComponent(ev.slug)}`

        return (
          <li
            key={ev.slug}
            className="overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated/80 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          >
            <div className="border-l-4 border-l-dc-accent/80 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-2xl text-dc-text">{ev.eventTitle}</h2>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        st.tone === 'live' && 'bg-dc-success-muted text-dc-success',
                        st.tone === 'draft' && 'bg-dc-warning-muted text-dc-warning',
                        st.tone === 'other' && 'bg-dc-elevated-muted text-dc-muted',
                      )}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-dc-muted">
                    <span className="text-dc-muted/80">Published as </span>
                    {ev.productTitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-dc-text">
                    {formatEventWindow(ev.windowStartsAt, ev.windowEndsAt, ev.timezone)}
                  </p>
                  <p className="mt-1 text-sm text-dc-muted">{humanRole(ev.role)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-dc-muted">{programSummary(ev)}</p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
                  >
                    Manage this event
                  </Link>
                  {ev.status === 'published' ? (
                    <Link
                      href={attendeePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-dc-border px-5 py-2.5 text-sm font-medium text-dc-text hover:border-dc-accent-border hover:bg-dc-surface-muted"
                    >
                      Preview attendee page
                    </Link>
                  ) : null}
                </div>
              </div>

              <div
                className="mt-5 rounded-xl border border-dc-accent-border/40 bg-dc-accent-muted/30 px-4 py-3.5"
                role="note"
              >
                <p className="text-sm font-medium text-dc-text">{next.headline}</p>
                <p className="mt-1 text-sm leading-relaxed text-dc-muted">{next.detail}</p>
                <Link href={next.href} className="mt-2 inline-block text-sm font-medium text-dc-accent hover:underline">
                  {next.actionLabel} →
                </Link>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
