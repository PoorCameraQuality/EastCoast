'use client'

import '@/styles/dancecard-landing-luxury.css'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatTime } from '@/components/dancecard/time'
import { eventWindowLabel, type DancecardEventMeta } from '@/lib/dancecard/eventDisplay'
import type { PublicAttendeeGuide } from '@/lib/dancecard/attendeeGuideJson'
import { publicAttendeeGuideHasContent } from '@/lib/dancecard/attendeeGuideJson'
import {
  humanizeEventTitle,
  humanizeProductTitle,
  humanizeLandingSubtitle,
  humanizeSharedByDetail,
  scheduleCountLabel,
} from '@/lib/dancecard/publicLandingCopy'
import { AttendeeAnnouncements } from '@/components/dancecard/attendee/AttendeeAnnouncements'
import { AttendeeWeekendGuide } from '@/components/dancecard/attendee/AttendeeWeekendGuide'

type ProgramSlotPeek = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  room: string | null
}

type Props = {
  eventSlug: string
  meta: DancecardEventMeta
  productTitle: string
  eventTitle: string
  subtitle: string
  programSlots: ProgramSlotPeek[]
  signInPanel: ReactNode
  onCreateAccount?: () => void
}

const PEEK_DESKTOP = 4
const PEEK_MOBILE = 5

function scrollToSignIn() {
  document.getElementById('dc-sign-in')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const HOW_IT_WORKS = [
  { title: 'Mark your time', body: 'Block when you are busy.' },
  { title: 'Compare privately', body: 'Mutual free windows only.' },
  { title: 'Reserve together', body: 'One tap to your dancecard.' },
] as const

function GuideQuickLinks({
  slug,
  guide,
  className = '',
}: {
  slug: string
  guide: PublicAttendeeGuide
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${className}`.trim()}>
      {guide.ticketingUrl ? (
        <a href={guide.ticketingUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--lux-champagne)] hover:underline">
          Tickets
        </a>
      ) : null}
      {guide.rabbitsignUrl ? (
        <a href={guide.rabbitsignUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--lux-champagne)] hover:underline">
          Sign policies
        </a>
      ) : null}
      <Link href={`/dancecard/${slug}/policies`} className="text-[var(--lux-muted)] hover:text-[var(--lux-champagne)] hover:underline">
        Policies
      </Link>
      <button type="button" onClick={scrollToSignIn} className="text-[var(--lux-muted)] hover:text-[var(--lux-champagne)] hover:underline">
        Sign in
      </button>
    </div>
  )
}

export function PublicDancecardLanding({
  eventSlug,
  meta,
  productTitle,
  eventTitle,
  subtitle,
  programSlots,
  signInPanel,
  onCreateAccount,
}: Props) {
  const slug = eventSlug.toLowerCase()
  const datesLabel = eventWindowLabel(meta)
  const displayProductTitle = humanizeProductTitle(productTitle)
  const displayEventTitle = humanizeEventTitle(eventTitle)
  const friendlySubtitle = humanizeLandingSubtitle(subtitle)
  const sharedByDetail = humanizeSharedByDetail(meta.sharedByDetail)
  const [attendeeGuide, setAttendeeGuide] = useState<PublicAttendeeGuide | null>(null)

  const loadGuide = useCallback(async () => {
    try {
      const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/attendee-guide`)
      const j = (await res.json()) as { guide?: PublicAttendeeGuide }
      if (res.ok && j.guide) setAttendeeGuide(j.guide)
    } catch {
      setAttendeeGuide(null)
    }
  }, [slug])

  useEffect(() => {
    void loadGuide()
  }, [loadGuide])

  const showGuideLanding = Boolean(attendeeGuide && publicAttendeeGuideHasContent(attendeeGuide))
  const upcoming = useMemo(() => {
    const now = Date.now()
    return [...programSlots]
      .filter((s) => new Date(s.endsAt).getTime() > now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  }, [programSlots])

  const scheduleLabel = scheduleCountLabel(programSlots.length)

  return (
    <div
      data-dc-landing="luxury"
      className="dc-lux-viewport relative min-h-[calc(100dvh-3.5rem)] bg-[var(--lux-ink)] text-[var(--lux-cream)]"
    >
      <div className="dc-lux-noise pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(198,167,94,0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:gap-3 lg:px-8 lg:py-4">
        {/* Hero — compact on desktop */}
        <header className="shrink-0 border-b border-[var(--lux-line)] pb-3 lg:pb-2.5">
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--lux-gold)]">
                  {displayProductTitle}
                </p>
                {datesLabel ? (
                  <p className="hidden font-serif text-sm italic text-[var(--lux-champagne)] lg:inline">{datesLabel}</p>
                ) : null}
              </div>
              <h1 className="mt-1 font-serif text-2xl font-medium leading-tight tracking-tight text-[var(--lux-cream)] sm:text-3xl lg:text-[1.75rem] lg:leading-snug">
                {displayEventTitle}
              </h1>
              {datesLabel ? (
                <p className="mt-0.5 font-serif text-sm italic text-[var(--lux-champagne)] lg:hidden">{datesLabel}</p>
              ) : null}
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-[var(--lux-muted)] lg:line-clamp-1 lg:text-[13px]">
                {friendlySubtitle}
              </p>
              {meta.sharedByLabel?.trim() ? (
                <p className="mt-1 hidden text-xs text-[var(--lux-muted)] lg:block">
                  Presented by <span className="text-[var(--lux-champagne)]">{meta.sharedByLabel.trim()}</span>
                  {sharedByDetail ? <span> · {sharedByDetail}</span> : null}
                </p>
              ) : null}
            </div>
            {meta.logoUrl ? (
              <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[var(--lux-line)] bg-[var(--lux-ink-elevated)] p-1.5 lg:block">
                <Image src={meta.logoUrl} alt="" fill className="object-contain" sizes="48px" unoptimized />
              </div>
            ) : null}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 lg:mt-2 lg:gap-2.5">
            <button
              type="button"
              onClick={scrollToSignIn}
              className="dc-lux-btn-primary rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition lg:px-5 lg:py-1.5"
            >
              Open my dancecard
            </button>
            <button
              type="button"
              onClick={() => {
                onCreateAccount?.()
                scrollToSignIn()
              }}
              className="dc-lux-btn-ghost rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition lg:py-1.5"
            >
              Register
            </button>
            <nav className="flex flex-wrap gap-x-3 text-xs font-medium lg:ml-auto" aria-label="Event resources">
              <Link href={`/dancecard/${slug}/map`} className="text-[var(--lux-champagne)] hover:underline">
                Map
              </Link>
              <Link href={`/dancecard/${slug}/policies`} className="text-[var(--lux-muted)] hover:text-[var(--lux-champagne)] hover:underline">
                Policies
              </Link>
              {programSlots.length > 0 ? (
                <a href="#dc-activities" className="text-[var(--lux-muted)] hover:text-[var(--lux-champagne)] hover:underline lg:hidden">
                  Schedule
                </a>
              ) : null}
            </nav>
          </div>

          {showGuideLanding && attendeeGuide ? (
            <GuideQuickLinks slug={slug} guide={attendeeGuide} className="mt-2 hidden border-t border-[var(--lux-line)] pt-2 lg:flex" />
          ) : null}
        </header>

        {/* Main — fills remaining viewport on desktop */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start lg:gap-5">
          <div className="flex flex-col gap-4 lg:gap-3">
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-3">
              {upcoming.length > 0 ? (
                <section id="dc-activities" className="dc-lux-card rounded-2xl p-3 sm:p-4 lg:p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-serif text-lg text-[var(--lux-cream)] lg:text-base">Activities</h2>
                    {scheduleLabel ? (
                      <p className="text-[10px] uppercase tracking-wider text-[var(--lux-muted)]">{scheduleLabel}</p>
                    ) : null}
                  </div>
                  <ul className="mt-2 divide-y divide-[var(--lux-line)] lg:mt-1.5">
                    {upcoming.slice(0, PEEK_MOBILE).map((slot, i) => (
                      <li
                        key={slot.id}
                        className={`dc-lux-activity-row flex gap-2.5 py-2 pl-1.5 text-sm lg:py-1.5 ${i >= PEEK_DESKTOP ? 'lg:hidden' : ''}`}
                      >
                        <p className="w-12 shrink-0 font-serif text-xs text-[var(--lux-gold)] lg:w-11">
                          {formatTime(slot.startsAt, meta.timezone)}
                        </p>
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-snug text-[var(--lux-cream)] lg:text-[13px]">
                            {slot.title}
                          </p>
                          {slot.room ? (
                            <p className="truncate text-xs text-[var(--lux-muted)]">{slot.room}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <section className="dc-lux-card hidden rounded-2xl p-3 lg:flex lg:items-center lg:justify-center">
                  <p className="text-sm text-[var(--lux-muted)]">Sign in to build your dancecard.</p>
                </section>
              )}

              <section className="dc-lux-card rounded-2xl p-3 sm:p-4 lg:p-3" aria-labelledby="dc-how-it-works">
                <h2 id="dc-how-it-works" className="font-serif text-lg text-[var(--lux-cream)] lg:text-base">
                  Plan privately
                </h2>
                <ol className="mt-2 grid gap-2 sm:grid-cols-3 lg:mt-1.5 lg:grid-cols-1 lg:gap-1.5">
                  {HOW_IT_WORKS.map((step, i) => (
                    <li
                      key={step.title}
                      className="rounded-lg border border-[var(--lux-line)]/60 bg-dc-elevated-muted px-2.5 py-2 lg:flex lg:items-start lg:gap-2 lg:py-1.5"
                    >
                      <span className="font-serif text-sm text-[var(--lux-gold-dim)] lg:text-xs">{i + 1}</span>
                      <div className="lg:min-w-0">
                        <p className="text-xs font-semibold text-[var(--lux-champagne)] lg:leading-tight">{step.title}</p>
                        <p className="text-[11px] leading-snug text-[var(--lux-muted)]">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            {/* Full guide — mobile / tablet scroll only */}
            {showGuideLanding ? (
              <section className="dc-lux-card rounded-2xl p-4 lg:hidden" id="weekend-guide">
                <AttendeeWeekendGuide eventSlug={slug} />
                <AttendeeAnnouncements eventSlug={slug} className="mt-3" variant="compact" />
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-20">
            <section id="dc-sign-in" className="dc-lux-signin rounded-2xl p-4 sm:p-5 lg:p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[var(--lux-gold)]">Member access</p>
              <h2 className="mt-1 font-serif text-xl text-[var(--lux-cream)] lg:text-lg">Your dancecard</h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--lux-muted)] lg:hidden">
                Sign in with your {displayEventTitle} account.
              </p>
              <div className="mt-3 lg:mt-2">{signInPanel}</div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
