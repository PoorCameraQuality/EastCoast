import type { Metadata } from 'next'
import Link from 'next/link'
import { DancecardEnterEventCode } from '@/components/dancecard/DancecardEnterEventCode'
import { DancecardPublicEventsList } from '@/components/dancecard/DancecardPublicEventsList'
import { DANCECARD_DEFAULT_EVENT_PATH } from '@/lib/dancecard/nav'

export const metadata: Metadata = {
  title: 'Dancecard — plan your event weekend',
  alternates: { canonical: '/dancecard' },
}

export default function DancecardProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dc-surface via-dc-surface-muted to-dc-surface text-dc-text">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dc-accent/90">East Coast Kink Events</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-dc-text sm:text-5xl">Dancecard</h1>
        <p className="mt-4 text-lg leading-relaxed text-dc-muted">
          One product, two modes: attendees carry a literal dancecard for program, compare, and reservations; organizers
          run program, registration, staff, and safety from a single console.
        </p>

        <div
          id="beta"
          className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 sm:p-5"
          role="note"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">Beta</h2>
          <p className="mt-2 text-sm leading-relaxed text-dc-muted">
            Dancecard is in active development. Features and data may change. We handle planning data with care; see our{' '}
            <Link href="/privacy" className="text-dc-accent underline hover:text-dc-accent-hover">
              privacy policy
            </Link>{' '}
            and{' '}
            <Link href="/contact" className="text-dc-accent underline hover:text-dc-accent-hover">
              contact us
            </Link>{' '}
            with feedback.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-dc-border bg-dc-elevated-muted/40 p-5">
            <h2 className="text-lg font-semibold text-dc-text">Attendees</h2>
            <p className="mt-2 text-sm text-dc-muted">Browse the program, compare availability, and build your dancecard.</p>
            <div className="mt-4">
              <DancecardEnterEventCode id="landing-event-code" />
            </div>
          </div>
          <div className="rounded-2xl border border-dc-border bg-dc-elevated-muted/40 p-5">
            <h2 className="text-lg font-semibold text-dc-text">Organizers</h2>
            <p className="mt-2 text-sm text-dc-muted">Program grid, registration, staff shifts, messaging, and integrations.</p>
            <Link
              href="/dancecard/organizers"
              className="mt-4 inline-flex min-h-touch items-center justify-center rounded-lg border border-dc-accent-border bg-dc-accent-muted px-4 py-2 text-sm font-semibold text-dc-accent hover:bg-dc-accent/20"
            >
              For organizers
            </Link>
          </div>
        </div>

        <section className="mt-12" aria-labelledby="live-events-heading">
          <h2 id="live-events-heading" className="text-lg font-semibold text-dc-text">
            Live events
          </h2>
          <p className="mt-1 text-sm text-dc-muted">Published schedules you can open now.</p>
          <div className="mt-4">
            <DancecardPublicEventsList />
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-dc-muted">
          <Link href={DANCECARD_DEFAULT_EVENT_PATH} className="text-dc-accent underline hover:text-dc-accent-hover">
            Demo event (paf26)
          </Link>
          {' · '}
          <Link href="/events" className="text-dc-muted underline hover:text-dc-text">
            Back to events calendar
          </Link>
        </p>
      </div>
    </div>
  )
}
