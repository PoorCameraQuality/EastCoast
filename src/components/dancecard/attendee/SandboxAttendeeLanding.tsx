'use client'

import '@/styles/dancecard-product-landing.css'
import DancecardAppearancePicker from '@/components/dancecard/DancecardAppearancePicker'
import Link from 'next/link'
import { useState } from 'react'
import { formatTime } from '@/components/dancecard/time'
import { eventWindowLabel, type DancecardEventMeta } from '@/lib/dancecard/eventDisplay'
import {
  humanizeEventTitle,
  humanizeLandingSubtitle,
  humanizeProductTitle,
  scheduleCountLabel,
} from '@/lib/dancecard/publicLandingCopy'
import {
  SANDBOX_DEMO_FEATURE_HIGHLIGHTS,
  SANDBOX_DEMO_PERSONAS,
  type SandboxDemoPersonaId,
} from '@/lib/dancecard/sandboxDemoPersonas'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'

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
  signInPanel: React.ReactNode
  onDemoEnter: () => void | Promise<void>
}

export function SandboxAttendeeLanding({
  eventSlug,
  meta,
  productTitle,
  eventTitle,
  subtitle,
  programSlots,
  signInPanel,
  onDemoEnter,
}: Props) {
  const slug = eventSlug.toLowerCase()
  const datesLabel = eventWindowLabel(meta)
  const displayProductTitle = humanizeProductTitle(productTitle)
  const displayEventTitle = humanizeEventTitle(eventTitle)
  const friendlySubtitle = humanizeLandingSubtitle(subtitle)
  const scheduleLabel = scheduleCountLabel(programSlots.length)
  const [busyPersona, setBusyPersona] = useState<SandboxDemoPersonaId | null>(null)
  const [demoErr, setDemoErr] = useState<string | null>(null)

  const upcoming = [...programSlots]
    .filter((s) => new Date(s.endsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 6)

  async function enterAsPersona(personaId: SandboxDemoPersonaId) {
    setDemoErr(null)
    setBusyPersona(personaId)
    try {
      await dancecardFetch(slug, '/demo-login', {
        method: 'POST',
        body: JSON.stringify({ personaId }),
      })
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`dc-vestibule-attendee:${slug}`, '1')
        window.sessionStorage.setItem(`dc-land-program-after-auth:${slug}`, '1')
      }
      await onDemoEnter()
    } catch (e) {
      setDemoErr(e instanceof DancecardApiError ? formatDancecardApiMessage(e) : 'Could not start demo.')
    } finally {
      setBusyPersona(null)
    }
  }

  return (
    <div data-dc-landing="product" className="min-h-[calc(100dvh-3.5rem)] bg-dc-surface text-dc-text">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,color-mix(in_srgb,var(--dc-accent)_16%,transparent),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
          <Link href="/dancecard" className="text-sm text-dc-accent hover:text-dc-accent-hover">
            Dancecard home
          </Link>
          <span className="dc-product-beta rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Free while in beta
          </span>
          <span className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1 text-xs font-medium text-dc-accent-hover">
            Same data as organizer sandbox
          </span>
          </div>
          <DancecardAppearancePicker compact />
        </div>

        <header className="mt-5 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dc-accent/80">{displayProductTitle}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{displayEventTitle}</h1>
          {datesLabel ? <p className="mt-1 font-serif text-sm italic text-dc-accent">{datesLabel}</p> : null}
          <p className="mt-3 text-base leading-relaxed text-dc-muted">{friendlySubtitle}</p>
          <p className="mt-2 text-sm text-dc-text-subtle">
            Pick a demo attendee below. No event password. One click loads a pre-filled dancecard tied to the organizer
            sandbox weekend.
          </p>
        </header>

        <section className="mt-8" aria-labelledby="sandbox-personas-heading">
          <h2 id="sandbox-personas-heading" className="font-serif text-xl font-semibold text-[#f4f0e8]">
            Try the attendee sandbox
          </h2>
          <p className="mt-1 text-sm text-[#a8a29a]">Each profile opens with seeded program blocks, compare data, and more.</p>
          {demoErr ? (
            <p className="mt-3 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-200" role="alert">
              {demoErr}
            </p>
          ) : null}
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {SANDBOX_DEMO_PERSONAS.map((persona) => (
              <div key={persona.id} className="dc-product-card flex flex-col rounded-2xl p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#c6a75e]">{persona.role}</p>
                <h3 className="mt-1 font-serif text-lg font-semibold text-white">{persona.displayName}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#a8a29a]">{persona.blurb}</p>
                <ul className="mt-3 space-y-1 text-xs text-[#78716c]">
                  {persona.tryThese.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={busyPersona !== null}
                  onClick={() => void enterAsPersona(persona.id)}
                  className="dc-product-btn-gold mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-60"
                >
                  {busyPersona === persona.id ? 'Opening dancecard…' : `Enter as ${persona.displayName}`}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="dc-product-card rounded-2xl p-4 sm:p-5" aria-labelledby="sandbox-features-heading">
            <h2 id="sandbox-features-heading" className="font-serif text-lg font-semibold">
              What is seeded in this demo
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {SANDBOX_DEMO_FEATURE_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[#a8a29a]">
                  <span className="text-[#c6a75e]" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link href={`/dancecard/${slug}/map`} className="text-[#c6a75e] underline hover:text-[#e8d5a8]">
                Venue map
              </Link>
              <Link href={`/dancecard/${slug}/policies`} className="text-[#c6a75e] underline hover:text-[#e8d5a8]">
                Policies
              </Link>
              <Link
                href="/organizer/dancecard/sandbox?tab=dashboard"
                className="text-[#a8a29a] underline hover:text-[#e8d5a8]"
              >
                Organizer sandbox
              </Link>
            </div>
          </section>

          {upcoming.length > 0 ? (
            <section className="dc-product-card rounded-2xl p-4 sm:p-5" aria-labelledby="sandbox-schedule-heading">
              <div className="flex items-baseline justify-between gap-2">
                <h2 id="sandbox-schedule-heading" className="font-serif text-lg font-semibold">
                  Sample program
                </h2>
                {scheduleLabel ? (
                  <p className="text-[10px] uppercase tracking-wider text-[#78716c]">{scheduleLabel}</p>
                ) : null}
              </div>
              <ul className="mt-3 divide-y divide-white/10">
                {upcoming.map((slot) => (
                  <li key={slot.id} className="flex gap-3 py-2.5 text-sm">
                    <span className="w-14 shrink-0 font-serif text-xs text-[#c6a75e]">
                      {formatTime(slot.startsAt, meta.timezone)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-[#f4f0e8]">{slot.title}</p>
                      {slot.room ? <p className="text-xs text-[#78716c]">{slot.room}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <details className="dc-product-card mt-8 rounded-2xl p-4 sm:p-5">
          <summary className="cursor-pointer list-none font-medium text-[#d6d3d1] [&::-webkit-details-marker]:hidden">
            Sign in with your own username (optional)
          </summary>
          <p className="mt-2 text-sm text-[#a8a29a]">
            Register a fresh account on the sandbox event, or use credentials from your seed output.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">{signInPanel}</div>
        </details>
      </div>
    </div>
  )
}
