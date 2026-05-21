import Link from 'next/link'
import { EventStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import EventLogo from '@/components/EventLogo'
import EventCalendarExport from '@/components/EventCalendarExport'
import { DancecardProductPitch } from '@/components/dancecard/DancecardProductPitch'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import MarkdownSimple from '@/components/MarkdownSimple'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import type { EventPageRecord } from '@/lib/unifiedEvents'

/** Subtle logo glow for flagship events; otherwise site primary. */
function logoAccentClass(slug: string): string {
  if (slug === 'primal-arts-festival') return 'from-red-500/60 via-orange-500/50 to-amber-500/40'
  if (slug === 'dark-odyssey-summer-camp') return 'from-primary-500/60 via-purple-500/50 to-indigo-500/40'
  return 'from-primary-500/50 via-rose-500/30 to-primary-600/40'
}

export default function EventDetailView({ event }: { event: EventPageRecord }) {
  const stateSlug = stateAbbrToSlug(event.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : event.location.state
  const hasFeatures = Boolean(event.features?.length)
  const hasLongCopy = Boolean(event.longDescription?.trim())

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: event.name, href: `/events/${event.slug}`, current: true },
  ]

  return (
    <DiscoveryPageShell accent="primary">
      <EventStructuredData event={event} />

      <section className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mt-2">
            <Link
              href="/events"
              className="mb-4 inline-flex min-h-touch items-center text-sm text-gray-400 transition hover:text-primary-300"
            >
              ← All events
            </Link>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                {event.logo ? (
                  <div className="relative shrink-0">
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${logoAccentClass(event.slug)} blur-xl opacity-60`}
                      aria-hidden
                    />
                    <EventLogo
                      src={event.logo}
                      alt={`${event.name} — ${event.category} in ${event.location.city}, ${event.location.state}`}
                      size="medium"
                      className="relative rounded-2xl border border-white/15 bg-black/50 p-3 shadow-xl backdrop-blur-sm"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400/90">
                    {event.category}
                  </p>
                  <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                    {event.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <span className="discovery-filter-pill">{event.date.display}</span>
                    <span className="discovery-filter-pill">
                      {event.location.city}, {event.location.state}
                    </span>
                    {event.location.region ? (
                      <span className="discovery-filter-pill text-gray-400">{event.location.region}</span>
                    ) : null}
                  </div>
                  {event.excerpt ? (
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                      {event.excerpt}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
                {event.website ? (
                  <OutboundWebsiteLink
                    href={event.website}
                    entityType="event"
                    entitySlug={event.slug}
                    entityName={event.name}
                    className="btn-primary w-full justify-center text-center"
                  >
                    Visit official site
                  </OutboundWebsiteLink>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {stateSlug ? (
                <Link
                  href={`/states/${stateSlug}`}
                  className="discovery-filter-pill justify-center sm:justify-start"
                >
                  {stateName} hub
                </Link>
              ) : null}
              {stateSlug ? (
                <Link
                  href={`/bdsm-events/${stateSlug}`}
                  className="discovery-filter-pill justify-center sm:justify-start"
                >
                  More events in {event.location.state}
                </Link>
              ) : null}
              <Link href="/events" className="discovery-filter-pill justify-center sm:justify-start">
                Browse all events
              </Link>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:gap-8">
            <div className="space-y-6">
              <article className="card-glass p-4 sm:p-6">
                <div className="card-glass-wash" aria-hidden />
                <div className="relative z-10">
                  <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">Event details</h2>
                  <p className="mt-2 text-xs text-gray-500">
                    Organizer-provided listing — confirm dates, registration, and policies on the official site.
                  </p>
                  {hasLongCopy ? (
                    <div className="prose-event mt-5 text-sm leading-relaxed text-gray-300 [&_.prose]:text-gray-300 [&_a]:text-primary-400 [&_a]:underline [&_strong]:text-white">
                      <MarkdownSimple content={event.longDescription!} />
                    </div>
                  ) : event.excerpt ? (
                    <p className="mt-5 text-sm leading-relaxed text-gray-300">{event.excerpt}</p>
                  ) : (
                    <p className="mt-5 text-sm text-gray-400">
                      Full program details are on the organizer&apos;s website.
                    </p>
                  )}
                </div>
              </article>

              {hasFeatures ? (
                <section className="card-glass p-4 sm:p-6">
                  <div className="card-glass-wash" aria-hidden />
                  <div className="relative z-10">
                    <h2 className="font-serif text-lg font-semibold text-white sm:text-xl">Highlights</h2>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {event.features!.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-gray-300"
                        >
                          <span className="mt-0.5 text-primary-400" aria-hidden>
                            ✓
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <DancecardProductPitch eckeSlug={event.slug} compact />
              <div className="card-glass p-4 sm:p-5">
                <div className="card-glass-wash" aria-hidden />
                <div className="relative z-10 space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">When</p>
                    <p className="mt-1 font-medium text-white">{event.date.display}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Where</p>
                    <p className="mt-1 font-medium text-white">
                      {event.location.city}, {event.location.state}
                    </p>
                    {event.location.region ? (
                      <p className="text-gray-400">{event.location.region}</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Type</p>
                    <p className="mt-1 text-gray-300">{event.category}</p>
                  </div>
                  {event.website ? (
                    <OutboundWebsiteLink
                      href={event.website}
                      entityType="event"
                      entitySlug={event.slug}
                      entityName={event.name}
                      className="inline-flex min-h-touch items-center text-sm font-medium text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline"
                    >
                      Official website →
                    </OutboundWebsiteLink>
                  ) : null}
                </div>
              </div>

              <EventCalendarExport event={event} />
            </aside>
          </div>

          <details className="group mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <summary className="flex min-h-touch cursor-pointer list-none items-center font-medium text-gray-300 hover:text-white [&::-webkit-details-marker]:hidden">
              <span className="mr-2 text-primary-400 transition group-open:rotate-90" aria-hidden>
                ▶
              </span>
              Community &amp; discovery links
            </summary>
            <div className="mt-4 space-y-4">
              <p className="text-sm text-gray-400">
                Questions about this event? Check the organizer&apos;s site first. For general community chat, join
                our Discord.
              </p>
              <Link
                href="https://discord.gg/xcnGGyGsmT"
                target="_blank"
                rel="noopener noreferrer"
                className="discovery-filter-pill inline-flex w-fit"
              >
                Join Discord
              </Link>
              <ListingHubLinks variant="event" stateAbbr={event.location.state} city={event.location.city} />
              <DiscoveryEngineStrip stateAbbr={event.location.state} />
            </div>
          </details>
        </div>
      </section>

      <div className="container-custom pb-12">
        <RelatedContent currentEvent={event} />
      </div>
    </DiscoveryPageShell>
  )
}
