'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { PublicAttendeeGuide } from '@/lib/dancecard/attendeeGuideJson'
import { publicAttendeeGuideHasContent } from '@/lib/dancecard/attendeeGuideJson'
import { cn } from '@/lib/cn'

type GuideResponse = {
  guide: PublicAttendeeGuide
  error?: string
}

export function AttendeeWeekendGuide({
  eventSlug,
  variant = 'attendee',
  className,
}: {
  eventSlug: string
  /** Organizer shell uses elevated panels; attendee uses lighter dc panels. */
  variant?: 'attendee' | 'organizer-classic'
  className?: string
}) {
  const slug = eventSlug.toLowerCase()
  const [guide, setGuide] = useState<PublicAttendeeGuide | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/attendee-guide`)
      const j = (await res.json()) as GuideResponse & { error?: string }
      if (!res.ok) {
        setErr(j.error ?? 'Could not load weekend guide')
        setGuide(null)
        return
      }
      setGuide(j.guide ?? null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
      setGuide(null)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  if (err || !guide || !publicAttendeeGuideHasContent(guide)) return null

  const shellClass =
    variant === 'organizer-classic'
      ? 'rounded-2xl border border-dc-border bg-dc-elevated-muted/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-4'
      : ''

  const linkClass =
    variant === 'organizer-classic'
      ? 'text-dc-accent underline-offset-4 hover:text-dc-accent-hover hover:underline'
      : 'text-dc-accent underline-offset-4 hover:text-dc-text hover:underline'

  const panelClass =
    variant === 'organizer-classic'
      ? 'rounded-xl border border-dc-border bg-dc-elevated-muted/60 p-4 text-dc-text'
      : 'rounded-xl border border-dc-border bg-dc-surface-muted/40 p-4 text-dc-text'

  const headingClass =
    variant === 'organizer-classic'
      ? 'font-serif text-lg text-dc-text'
      : 'font-serif text-2xl font-medium tracking-tight text-dc-text'

  return (
    <div className={cn(shellClass, 'space-y-3', className)}>
      <div>
        <p
          className={
            variant === 'organizer-classic'
              ? 'text-[10px] font-semibold uppercase tracking-[0.28em] text-dc-muted'
              : 'text-[11px] font-semibold uppercase tracking-[0.38em] text-dc-accent/80'
          }
        >
          Weekend guide
        </p>
        <h2 className={cn('mt-1', headingClass)}>Before you arrive</h2>
      </div>

      {(guide.ticketingUrl || guide.rabbitsignUrl) && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          {guide.ticketingUrl ? (
            <a href={guide.ticketingUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Registration / ticketing
            </a>
          ) : null}
          {guide.rabbitsignUrl ? (
            <a href={guide.rabbitsignUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Sign policies (RabbitSign)
            </a>
          ) : null}
          <Link href={`/dancecard/${slug}/policies`} className={linkClass}>
            Published policies
          </Link>
        </div>
      )}

      {guide.sections.map((s) => {
        const hasBody = (s.markdown ?? '').trim().length > 0
        const expanded = openSectionId === s.id
        return (
          <div key={s.id} className={panelClass}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
              aria-expanded={expanded}
              onClick={() => setOpenSectionId((cur) => (cur === s.id ? null : s.id))}
            >
              <span className="font-semibold">{s.title}</span>
              <span className="shrink-0 text-xs opacity-70">{expanded ? '−' : '+'}</span>
            </button>
            {expanded && hasBody ? (
              <div
                className={
                  variant === 'organizer-classic'
                    ? 'prose prose-invert prose-sm mt-3 max-w-none text-dc-muted'
                    : 'prose prose-invert prose-sm mt-3 max-w-none text-dc-muted'
                }
              >
                <ReactMarkdown>{s.markdown ?? ''}</ReactMarkdown>
              </div>
            ) : null}
            {expanded && !hasBody ? (
              <p
                className={
                  variant === 'organizer-classic' ? 'mt-2 text-xs text-dc-muted' : 'mt-2 text-dc-micro text-dc-muted'
                }
              >
                No additional details for this section.
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
