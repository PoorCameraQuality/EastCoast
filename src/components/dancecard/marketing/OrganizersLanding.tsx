import Link from 'next/link'
import { OrganizersScreenshotGallery } from '@/components/dancecard/marketing/OrganizersScreenshotGallery'
import { ORGANIZER_FEATURES } from '@/components/dancecard/marketing/marketingWalkthroughData'

const LOGIN = '/organizer/login?next=%2Forganizer%2Fdancecard'
const SIGNUP = '/organizer/login?view=signup&next=%2Forganizer%2Fdancecard'
const SANDBOX = '/organizer/dancecard/sandbox?tab=dashboard'

const PILLARS = [
  {
    title: 'Build the weekend',
    body: 'Map your venue, grid your program, pull in your spreadsheet. Publish when you are ready, not when the website finally cooperates.',
  },
  {
    title: 'Run the door and the crew',
    body: 'Check people in with waiver status in view. Print badges. Staff the shifts. Catch conflicts before they become hallway arguments.',
  },
  {
    title: 'One link for attendees',
    body: 'Announcements, live schedule, compare and reserve, signed policies, your camp map. Same data you edited in the console.',
  },
] as const

const STEPS = [
  {
    n: '1',
    title: 'Create your organizer account',
    body: 'Sign up with email. Confirm the link when it arrives. You are in.',
  },
  {
    n: '2',
    title: 'Create or join an event',
    body: 'Start a new event from the hub, or ask the owner to add your email if you are joining an existing team.',
  },
  {
    n: '3',
    title: 'Import, schedule, go live',
    body: 'Bring in your spreadsheet, place classes and rooms, check people in at the gate, and hand attendees one dancecard link.',
  },
] as const

export function OrganizersLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dc-surface via-dc-surface-muted to-dc-surface text-dc-text">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_80%_55%_at_50%_-15%,rgba(198,167,94,0.16),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <Link href="/dancecard" className="text-sm text-dc-accent/90 transition hover:text-dc-accent-hover">
          ← Dancecard home
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dc-accent/90">
            East Coast Kink Events
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-dc-text sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
            Run the weekend from one backstage
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-dc-muted sm:text-xl">
            You already juggle spreadsheets, PDF waivers, registration exports, and a group chat where everyone
            shares the same password. Dancecard is the organizer console for that work, plus the attendee dancecard
            your people actually open on their phones.
          </p>
          <p className="mt-4 text-base leading-relaxed text-dc-muted">
            Camp weekends. Hotel takeovers. Any event where the schedule, the door, and the map need to stay in sync.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={LOGIN}
              className="dc-btn-primary inline-flex min-h-12 items-center justify-center rounded-xl bg-dc-accent px-8 py-3 text-base font-bold text-dc-accent-foreground shadow-[0_0_32px_rgba(198,167,94,0.28)] transition hover:bg-dc-accent-hover"
            >
              Sign in to console
            </Link>
            <Link
              href={SANDBOX}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-dc-accent-border bg-dc-accent-muted px-8 py-3 text-base font-semibold text-dc-accent transition hover:bg-dc-accent/20"
            >
              Try the sandbox demo
            </Link>
            <Link
              href={SIGNUP}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-dc-border bg-dc-elevated-muted px-8 py-3 text-base font-semibold text-dc-text transition hover:border-dc-accent-border hover:bg-dc-elevated-solid/80"
            >
              Create organizer account
            </Link>
          </div>
          <p className="mt-4 text-sm text-dc-muted">
            Already have a ticket?{' '}
            <Link href="/dancecard" className="text-dc-accent/90 underline hover:text-dc-accent-hover">
              Open the attendee dancecard
            </Link>
          </p>
        </header>

        <section className="mt-14 grid gap-4 sm:grid-cols-3" aria-labelledby="pillars-heading">
          <h2 id="pillars-heading" className="sr-only">
            Why organizers use Dancecard
          </h2>
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-dc-border bg-dc-elevated-muted/30 p-5 backdrop-blur-sm"
            >
              <h3 className="text-base font-semibold text-dc-text">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dc-muted">{p.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16" aria-labelledby="organizer-walkthrough-heading">
          <div className="max-w-3xl">
            <h2 id="organizer-walkthrough-heading" className="font-serif text-2xl text-dc-text sm:text-3xl">
              What you get as an organizer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dc-muted sm:text-base">
              Scroll the real screens. Every screenshot is from our Sandbox Con demo. Click any image to blow it up.
              This is the toolkit your team runs on; the section after shows what your attendees see when you publish.
            </p>
            <p className="mt-2 text-xs text-dc-muted">
              <strong className="font-semibold text-dc-text">{ORGANIZER_FEATURES.length}</strong> organizer tools, then
              the attendee experience.
            </p>
          </div>

          <OrganizersScreenshotGallery />
        </section>

        <section
          className="mt-16 rounded-2xl border border-dc-border bg-gradient-to-br from-dc-elevated-muted/80 to-dc-surface-muted/90 p-6 sm:p-8"
          aria-labelledby="steps-heading"
        >
          <h2 id="steps-heading" className="font-serif text-2xl text-dc-text">
            Three steps to your first event
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dc-accent-muted text-sm font-bold text-dc-accent"
                  aria-hidden
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="font-semibold text-dc-text">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-dc-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2" aria-labelledby="ops-heading">
          <div className="rounded-2xl border border-dc-border bg-dc-elevated-muted/25 p-6">
            <h2 id="ops-heading" className="text-lg font-semibold text-dc-text">
              Logins, email, and your team
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-dc-muted">
              Organizers sign in with email (password reset included). When you are ready to email registrants in bulk,
              you connect your mail provider in settings. No magic, just standard setup.
            </p>
            <Link
              href="/docs/organizer-auth-and-email.md"
              className="mt-4 inline-flex text-sm font-medium text-dc-accent hover:text-dc-accent-hover"
            >
              Setup guide for auth and email →
            </Link>
          </div>
          <div className="rounded-2xl border border-dc-border bg-dc-elevated-muted/25 p-6">
            <h2 className="text-lg font-semibold text-dc-text">Bring the whole crew</h2>
            <p className="mt-2 text-sm leading-relaxed text-dc-muted">
              Programming, registration, door, volunteers, and safety can each have their own login. Owners decide who
              can edit, who can only view, and who sees sensitive vetting notes. Nobody has to share one password in
              the org chat anymore.
            </p>
            <p className="mt-3 text-sm text-dc-muted">
              Joining an event someone else owns? Ask them to add your email, or{' '}
              <Link href="/contact" className="text-dc-accent hover:text-dc-accent-hover">
                contact us
              </Link>
              .
            </p>
          </div>
        </section>

        <div className="mt-14 flex flex-col items-center rounded-2xl border border-dc-accent-border bg-dc-accent-muted px-6 py-10 text-center">
          <p className="font-serif text-2xl text-dc-text">And there is more where that came from</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-dc-muted">
            Messaging, exports, integrations, vetting workflows, and the public East Coast Kink Events calendar. We
            built this for the community we already show up for. Come see if it fits your next event.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={LOGIN}
              className="dc-btn-primary inline-flex min-h-12 items-center justify-center rounded-xl bg-dc-accent px-10 py-3 text-base font-bold text-dc-accent-foreground hover:bg-dc-accent-hover"
            >
              Open organizer console
            </Link>
            <Link
              href={SANDBOX}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-dc-border bg-dc-elevated-muted px-8 py-3 text-base font-semibold text-dc-text hover:border-dc-accent-border"
            >
              Explore sandbox demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
