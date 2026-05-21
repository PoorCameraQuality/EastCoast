import { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import DirectoryCompactStats from '@/components/discovery/DirectoryCompactStats'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import StateQuickChips from '@/components/states/StateQuickChips'
import { BASE_URL } from '@/lib/seo'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import { getStateStats, type StateStatEntry } from '@/lib/stateStats'

export const metadata: Metadata = {
  title: 'Kink & BDSM Events by State — Dungeons & Parties Near You',
  description:
    'Pick your state for upcoming kink & BDSM events plus dungeon listings—NY, NJ, DC, FL, PA, and more. Built for “near me” and regional search.',
  alternates: {
    canonical: `${BASE_URL}/states`,
  },
}

const REGION_ORDER = [
  'Northeast',
  'Mid-Atlantic',
  'New England',
  'South',
  'South Central',
  'Midwest',
  'Great Plains',
  'Mountain West',
  'Southwest',
  'Pacific',
  'Canada',
] as const

function RegionGrid({ states }: { states: StateStatEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {states.map(({ slug, info, eventCount, dungeonCount }) => (
        <Link
          key={slug}
          href={`/states/${slug}`}
          className="group flex min-h-touch flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center transition hover:border-primary-500/30 hover:bg-white/[0.05] motion-safe:hover:-translate-y-0.5"
        >
          <span className="text-2xl sm:text-3xl" aria-hidden>
            {info.emoji}
          </span>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary-400/90">{info.abbr}</p>
          <h3 className="mt-1 font-serif text-sm font-semibold text-white group-hover:text-primary-100 sm:text-base">
            {info.name}
          </h3>
          <div className="mt-3 flex flex-col items-center gap-1 text-[11px] text-gray-400 sm:text-xs">
            <span className="rounded-md bg-black/40 px-2 py-0.5 ring-1 ring-white/5">
              {eventCount} {eventCount === 1 ? 'event' : 'events'}
            </span>
            <span className="rounded-md bg-black/40 px-2 py-0.5 ring-1 ring-white/5">
              {dungeonCount} {dungeonCount === 1 ? 'dungeon' : 'dungeons'}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

function SpotlightCard({ slug, info, eventCount, dungeonCount }: StateStatEntry) {
  return (
    <Link
      href={`/states/${slug}`}
      className="card-glass group flex min-h-touch flex-col p-5 motion-safe:hover:-translate-y-0.5 sm:p-6"
    >
      <div className="card-glass-wash" aria-hidden />
      <div className="relative z-10 flex items-start gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 text-xl ring-1 ring-white/10"
          aria-hidden
        >
          {info.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-400/90">
            {info.abbr} · {info.region}
          </p>
          <h3 className="mt-1 font-serif text-lg font-bold text-white group-hover:text-primary-100">{info.name}</h3>
        </div>
      </div>
      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-200 ring-1 ring-white/10">
          {eventCount} upcoming
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-200 ring-1 ring-white/10">
          {dungeonCount} dungeons
        </span>
      </div>
      <span className="relative z-10 mt-3 text-sm font-semibold text-primary-300/90 group-hover:text-primary-200">
        Open hub →
      </span>
    </Link>
  )
}

export default function StatesIndexPage() {
  const stateStats = getStateStats()
  const spotlight = stateStats.filter((s) => s.total > 0).slice(0, 6)

  const regions = REGION_ORDER.map((regionName) => ({
    name: regionName,
    states: stateStats.filter((s) => s.info.region === regionName),
  })).filter((r) => r.states.length > 0)

  const totalEvents = stateStats.reduce((sum, s) => sum + s.eventCount, 0)
  const totalDungeons = stateStats.reduce((sum, s) => sum + s.dungeonCount, 0)
  const activeStates = stateStats.filter((s) => s.total > 0).length

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states', current: true },
  ]

  return (
    <DiscoveryPageShell accent="primary">
      <div className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mb-5 max-w-3xl md:mb-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-400/90">Near me</p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
              Kink events &amp; dungeons{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-cyan-400 bg-clip-text text-transparent">
                by state
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-300">
              Pick a state chip or browse by region—upcoming parties and venue listings near you.
            </p>
            <details className="group mt-3">
              <summary className="flex min-h-touch cursor-pointer list-none items-center text-sm font-medium text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition group-open:rotate-90" aria-hidden>
                  ▶
                </span>
                About state hubs
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Grouped the way people search (&quot;near me&quot;). Use a quick chip, hotspot card, or browse every
                region below. Also see{' '}
                <Link href="/events" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  all events
                </Link>
                ,{' '}
                <Link href="/dungeons" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  dungeons
                </Link>
                , and the{' '}
                <Link
                  href="/directory-snapshot"
                  className="text-primary-400 underline underline-offset-2 hover:text-primary-300"
                >
                  directory snapshot
                </Link>
                .
              </p>
            </details>
          </header>

          <section className="mb-8 md:mb-10" aria-labelledby="states-chips-heading">
            <h2 id="states-chips-heading" className="mb-3 font-serif text-lg font-semibold text-white">
              Top states
            </h2>
            <StateQuickChips stats={stateStats} limit={14} />
          </section>

          {spotlight.length > 0 ? (
            <section className="mb-10 md:mb-12" aria-labelledby="spotlight-title">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 id="spotlight-title" className="font-serif text-xl font-bold text-white sm:text-2xl">
                  <span className="bg-gradient-to-r from-primary-300 to-cyan-300 bg-clip-text text-transparent">
                    Hotspots
                  </span>
                </h2>
                <p className="text-sm text-gray-500">Most upcoming listings right now</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {spotlight.map((entry) => (
                  <SpotlightCard key={entry.slug} {...entry} />
                ))}
              </div>
            </section>
          ) : null}

          <details className="group mb-10 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 md:mb-12">
            <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-2 font-serif text-lg font-semibold text-white sm:text-xl [&::-webkit-details-marker]:hidden">
              <span>
                Browse all regions
                <span className="ml-2 text-sm font-normal text-gray-500">({stateStats.length} hubs)</span>
              </span>
              <span className="text-primary-400 transition group-open:rotate-90" aria-hidden>
                ▶
              </span>
            </summary>
            <div className="mt-6 space-y-10">
              {regions.map(({ name, states }) => (
                <section key={name} aria-labelledby={`region-${name.replace(/\s+/g, '-').toLowerCase()}`}>
                  <h3
                    id={`region-${name.replace(/\s+/g, '-').toLowerCase()}`}
                    className="mb-4 border-b border-primary-500/25 pb-2 font-serif text-lg font-semibold text-white"
                  >
                    {name}
                  </h3>
                  <RegionGrid states={states} />
                </section>
              ))}
            </div>
          </details>

          <div className="stack-ecke-md mb-12 border-t border-white/[0.06] pt-8">
            <DirectoryCompactStats
              stats={[
                { label: 'upcoming events', value: totalEvents, accent: true },
                { label: 'dungeon listings', value: totalDungeons },
                { label: 'states with activity', value: activeStates },
                { label: 'total hubs', value: stateStats.length },
              ]}
            />
            <SupportCTAInline contextLabel="States" variant="stack" />
          </div>

          <section
            className="discovery-empty-panel relative overflow-hidden p-8 text-center sm:p-10"
            aria-labelledby="cta-state-missing"
          >
            <h2 id="cta-state-missing" className="font-serif text-2xl font-bold text-white">
              Don&apos;t see enough in your area?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-gray-300">
              We grow with submissions—tell us about parties, dungeons, and shops worth listing.
            </p>
            <Link
              href="/contact"
              className="btn-primary mt-6 inline-flex min-h-touch items-center justify-center px-8"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </section>
        </div>
      </div>
    </DiscoveryPageShell>
  )
}
