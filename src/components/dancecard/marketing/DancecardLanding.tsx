import Link from 'next/link'
import '@/styles/dancecard-product-landing.css'
import DancecardAppearancePicker from '@/components/dancecard/DancecardAppearancePicker'
import { DancecardPublicEventsList } from '@/components/dancecard/DancecardPublicEventsList'
import {
  DANCECARD_ATTENDEE_SANDBOX_PATH,
  DANCECARD_ORGANIZER_SANDBOX_PATH,
  ECKE_EVENT_SYSTEMS_LOGIN_PATH,
} from '@/lib/dancecard/nav'

export function DancecardLanding() {
  return (
    <div data-dc-landing="product" className="min-h-screen bg-dc-surface text-dc-text">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_srgb,var(--dc-accent)_18%,transparent),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm text-dc-accent transition hover:text-dc-accent-hover">
            Back to East Coast Kink Events
          </Link>
          <DancecardAppearancePicker />
        </div>

        <header className="mt-6 border-b border-dc-border pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dc-accent/80">
              East Coast Kink Events
            </p>
            <span className="dc-product-beta rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
              Free while in beta
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-bold text-dc-text sm:text-5xl">Dancecard</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-dc-muted sm:text-lg">
            Plan your kink weekend on your phone. Organizers run program, door, and staff from one console.
          </p>
        </header>

        <p className="text-center text-sm text-dc-muted">
          No event code. No waiting on your organizer. Open a sandbox demo or sign in for a real event.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:gap-6">
          <PathCard
            title="Attendees"
            bullets={[
              'Sample program on your phone',
              'Try compare and reserve with demo accounts',
              'Browse without an access password',
            ]}
            sandboxHref={DANCECARD_ATTENDEE_SANDBOX_PATH}
            sandboxLabel="Attendee sandbox demo"
          />
          <PathCard
            title="Organizers"
            bullets={[
              'Program grid and room map',
              'Roster, door check-in, staff shifts',
              'Shared demo data, no login required to look',
            ]}
            sandboxHref={DANCECARD_ORGANIZER_SANDBOX_PATH}
            sandboxLabel="Organizer sandbox demo"
          />
        </div>

        <div className="dc-product-card mt-8 rounded-2xl p-5 sm:p-6">
          <p className="text-center text-sm font-medium text-dc-text">Ready for a real event?</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href={DANCECARD_ATTENDEE_SANDBOX_PATH} className="dc-product-btn-gold inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-center text-sm sm:text-base">
              Use Dancecard
            </Link>
            <Link
              href={ECKE_EVENT_SYSTEMS_LOGIN_PATH}
              className="dc-product-btn-outline inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-center text-sm font-semibold sm:text-base"
            >
              Use ECKE Event Systems
            </Link>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-dc-muted">
            Use Dancecard opens the public attendee demo. Use ECKE Event Systems is for organizers signing in to run
            live events.
          </p>
        </div>

        <section className="dc-product-card mt-10 rounded-2xl p-5 sm:p-6" aria-labelledby="live-events-heading">
          <h2 id="live-events-heading" className="font-serif text-xl font-semibold text-dc-text">
            Published weekends
          </h2>
          <p className="mt-2 text-sm text-dc-muted">
            When an organizer has published Dancecard for their event, it appears here.
          </p>
          <div className="mt-4 [&_a]:text-dc-accent [&_li]:border-dc-border [&_p]:text-dc-muted">
            <DancecardPublicEventsList />
          </div>
        </section>

        <details className="mt-6 rounded-xl border border-dc-border bg-dc-elevated-muted p-4 text-sm text-dc-muted">
          <summary className="cursor-pointer font-medium text-dc-text [&::-webkit-details-marker]:hidden">
            Have a direct link from your organizer?
          </summary>
          <p className="mt-3 leading-relaxed">
            Some events use a short URL like{' '}
            <Link href="/dancecard/sandbox" className="font-mono text-dc-accent underline">
              /dancecard/sandbox
            </Link>{' '}
            for the public demo, or their own slug when they go live. Start with the sandbox buttons above if you are
            just exploring.
          </p>
        </details>

        <p className="mt-8 text-center text-sm text-dc-text-subtle">
          <Link href="/dancecard/organizers" className="text-dc-accent underline hover:text-dc-accent-hover">
            Organizer tour and screenshots
          </Link>
          <span className="mx-2">|</span>
          <Link href="/dancecard/palette-lab" className="text-dc-accent underline hover:text-dc-accent-hover">
            Palette lab
          </Link>
          <span className="mx-2">|</span>
          <Link href="/events" className="underline hover:text-dc-text">
            Events calendar
          </Link>
        </p>
      </div>
    </div>
  )
}

function PathCard({
  title,
  bullets,
  sandboxHref,
  sandboxLabel,
}: {
  title: string
  bullets: string[]
  sandboxHref: string
  sandboxLabel: string
}) {
  return (
    <div className="dc-product-card flex h-full flex-col rounded-2xl p-5 sm:p-6">
      <h2 className="font-serif text-2xl font-semibold text-dc-text">{title}</h2>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-dc-muted">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-dc-accent" aria-hidden>
              •
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <Link
        href={sandboxHref}
        className="dc-product-btn-gold mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl px-4 py-3 text-sm sm:text-base"
      >
        {sandboxLabel}
      </Link>
    </div>
  )
}
