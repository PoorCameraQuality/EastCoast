'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { OrganizerHubClient } from '@/components/dancecard/organizer/OrganizerHubClient'
import { C2kFromBanner } from '@/components/dancecard/organizer/C2kFromBanner'
import { OrganizerHubEventList } from '@/components/dancecard/organizer/hub/OrganizerHubEventList'
import { OrganizerHubHowItWorks } from '@/components/dancecard/organizer/hub/OrganizerHubHowItWorks'
import type { OrganizerHubEventWithStats } from '@/lib/dancecard/organizerHubStats'

export function OrganizerHubPageClient({ events }: { events: OrganizerHubEventWithStats[] }) {
  const hasEvents = events.length > 0
  const [createOpen, setCreateOpen] = useState(!hasEvents)

  const openCreateForm = useCallback(() => {
    setCreateOpen(true)
  }, [])

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-dc-accent/8 to-transparent"
        aria-hidden
      />

      <C2kFromBanner />

      <header className="relative">
        <p className="text-sm font-medium text-dc-accent">Dancecard organizer</p>
        <h1 className="mt-2 font-serif text-3xl text-dc-text sm:text-4xl">Event console</h1>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-dc-accent px-6 py-3 text-base font-semibold text-dc-accent-foreground shadow-[0_0_24px_rgba(45,212,191,0.25)] hover:bg-dc-accent-hover sm:w-auto"
          >
            + Create new event
          </button>
          {hasEvents ? (
            <p className="text-sm text-dc-muted sm:ml-2">
              or open an existing event below
            </p>
          ) : null}
        </div>
      </header>

      <OrganizerHubHowItWorks />

      {hasEvents ? (
        <section aria-labelledby="hub-events-heading" className="relative mt-2">
          <h2 id="hub-events-heading" className="mb-3 text-sm font-semibold text-dc-text">
            {events.length === 1 ? 'Your event' : `Established events (${events.length})`}
          </h2>
          <OrganizerHubEventList events={events} />
          <p className="mt-6 rounded-xl border border-dc-border/60 bg-dc-surface-muted/40 px-4 py-3 text-sm leading-relaxed text-dc-muted">
            <span className="font-medium text-dc-text">Attendee link:</span> not on this page. Open an event, then use
            Dashboard to copy the public Dancecard URL.{' '}
            <Link href="/dancecard/organizers" className="text-dc-accent hover:underline">
              What organizers get
            </Link>
          </p>
        </section>
      ) : (
        <div className="relative mt-4 rounded-2xl border border-dashed border-dc-border bg-dc-elevated-muted/40 px-6 py-8 text-center">
          <p className="text-base text-dc-text">No events on your account yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dc-muted">
            Click <strong className="text-dc-text">Create new event</strong> above to get started. If a teammate already
            created the convention, ask them to add you as an organizer instead.
          </p>
        </div>
      )}

      <OrganizerHubClient open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
