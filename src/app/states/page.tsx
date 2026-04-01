import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import HeroSponsorLayout from '@/components/HeroSponsorLayout'
import { BASE_URL } from '@/lib/seo'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

export const metadata: Metadata = {
  title: 'Kink & BDSM Events by State — Dungeons & Parties Near You',
  description:
    'Pick your state for upcoming kink & BDSM events plus dungeon listings—NY, NJ, DC, FL, PA, and more. Built for “near me” and regional search.',
  alternates: {
    canonical: `${BASE_URL}/states`,
  },
}

function StatPill({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm sm:px-5 sm:py-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-300"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="font-serif text-xl font-bold tabular-nums text-white sm:text-2xl">{value}</p>
        {sub ? <p className="text-xs text-gray-500">{sub}</p> : null}
      </div>
    </div>
  )
}

export default function StatesIndexPage() {
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const now = new Date()

  const stateStats = Object.entries(EAST_COAST_STATES).map(([slug, info]) => {
    const eventCount = allEvents.filter(
      (event) => event.location.state === info.abbr && new Date(event.date.end) >= now
    ).length
    const dungeonCount = allDungeons.filter((dungeon) => dungeon.location.state === info.abbr).length

    return { slug, info, eventCount, dungeonCount, total: eventCount + dungeonCount }
  })

  const sortByActivity = (
    a: (typeof stateStats)[number],
    b: (typeof stateStats)[number]
  ) => b.total - a.total || b.eventCount - a.eventCount || a.info.name.localeCompare(b.info.name)

  stateStats.sort(sortByActivity)

  const regions = {
    'New England': stateStats.filter((s) => s.info.region === 'New England'),
    'Mid-Atlantic': stateStats.filter((s) => s.info.region === 'Mid-Atlantic'),
    Northeast: stateStats.filter((s) => s.info.region === 'Northeast'),
    South: stateStats.filter((s) => s.info.region === 'South'),
    'South Central': stateStats.filter((s) => s.info.region === 'South Central'),
    Midwest: stateStats.filter((s) => s.info.region === 'Midwest'),
    'Great Plains': stateStats.filter((s) => s.info.region === 'Great Plains'),
    'Mountain West': stateStats.filter((s) => s.info.region === 'Mountain West'),
    Pacific: stateStats.filter((s) => s.info.region === 'Pacific'),
    Southwest: stateStats.filter((s) => s.info.region === 'Southwest'),
  }

  for (const list of Object.values(regions)) {
    list.sort(sortByActivity)
  }

  const totalEvents = stateStats.reduce((sum, s) => sum + s.eventCount, 0)
  const totalDungeons = stateStats.reduce((sum, s) => sum + s.dungeonCount, 0)
  const stateCount = Object.keys(EAST_COAST_STATES).length

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states', current: true },
  ]

  const spotlight = stateStats.slice(0, 6)

  const regionSectionTitleClass =
    'font-serif text-xl font-semibold text-white sm:text-2xl border-b border-primary-500/25 pb-3 mb-6'

  return (
    <div className="relative min-h-screen overflow-hidden bg-black section-padding">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-primary-400 blur-3xl" />
        <div className="absolute -right-10 bottom-40 h-72 w-72 rounded-full bg-primary-600 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/40 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <Breadcrumb items={breadcrumbItems} />

        <HeroSponsorLayout contextLabel="States">
          <header className="max-w-3xl text-center md:px-2 lg:text-left lg:mx-0">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary-400/90">
              Browse by region
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Kink events &amp; dungeons{' '}
              <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent">
                by state
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg lg:mx-0">
              Upcoming parties and cons, plus dungeon listings—grouped the way people actually search (&quot;near
              me&quot;). Jump to a hotspot below or scroll your region.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Fast path:{' '}
              <Link href="/events" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                all events
              </Link>{' '}
              ·{' '}
              <Link href="/dungeons" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                all dungeons
              </Link>{' '}
              ·{' '}
              <Link
                href="/directory-snapshot"
                className="text-primary-400 underline underline-offset-2 hover:text-primary-300"
              >
                directory snapshot
              </Link>
            </p>

            <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:mx-0 lg:justify-start">
              <StatPill
                label="Upcoming"
                value={totalEvents}
                sub="events on calendar"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <StatPill
                label="Directory"
                value={totalDungeons}
                sub="dungeon & venue listings"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
              />
              <StatPill
                label="Coverage"
                value={stateCount}
                sub="US + DC + Canada"
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>
          </header>
        </HeroSponsorLayout>

        <section className="mb-16 md:mb-20" aria-labelledby="spotlight-title">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="spotlight-title"
              className="mb-0 font-serif text-xl font-semibold text-white sm:text-2xl"
            >
              Right now · most activity
            </h2>
            <p className="max-w-md text-sm text-gray-500">
              Ranked by upcoming listings in each state. Follow through for full calendars and dungeon notes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spotlight.map(({ slug, info, eventCount, dungeonCount }) => (
              <Link
                key={slug}
                href={`/states/${slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-transparent to-primary-950/20 p-5 shadow-lg transition duration-300 hover:border-primary-500/35 hover:from-primary-500/[0.08] motion-safe:hover:-translate-y-0.5 min-h-touch flex flex-col sm:p-6"
              >
                <div
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl transition group-hover:bg-primary-400/20"
                  aria-hidden
                />
                <div className="relative flex items-start gap-4">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/40 text-2xl ring-1 ring-white/10 transition group-hover:ring-primary-500/30"
                    aria-hidden
                  >
                    {info.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary-400/90">
                      {info.abbr} · {info.region}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-white transition group-hover:text-primary-100">
                      {info.name}
                    </h3>
                  </div>
                </div>
                <div className="relative mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-200 ring-1 ring-white/10">
                    {eventCount} upcoming {eventCount === 1 ? 'event' : 'events'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-200 ring-1 ring-white/10">
                    {dungeonCount} {dungeonCount === 1 ? 'dungeon' : 'dungeons'}
                  </span>
                </div>
                <span className="relative mt-4 text-sm font-medium text-primary-400 transition group-hover:text-primary-300">
                  Open state hub <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {Object.entries(regions).map(([regionName, states]) =>
          states.length > 0 ? (
            <section
              key={regionName}
              className="mb-14 md:mb-16"
              aria-labelledby={`region-${regionName.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <h2 id={`region-${regionName.replace(/\s+/g, '-').toLowerCase()}`} className={regionSectionTitleClass}>
                {regionName}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {states.map(({ slug, info, eventCount, dungeonCount }) => (
                  <Link
                    key={slug}
                    href={`/states/${slug}`}
                    className="group flex min-h-touch flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center transition hover:border-primary-500/30 hover:bg-white/[0.05] motion-safe:hover:-translate-y-0.5 sm:p-4"
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden>
                      {info.emoji}
                    </span>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary-400/90">
                      {info.abbr}
                    </p>
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
            </section>
          ) : null
        )}

        <section
          className="relative mt-20 overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-950/40 via-black to-black p-8 text-center shadow-[0_0_40px_-10px_rgba(20,184,166,0.35)] sm:p-10"
          aria-labelledby="cta-state-missing"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.12),transparent_55%)]" aria-hidden />
          <h2 id="cta-state-missing" className="relative font-serif text-2xl font-bold text-white">
            Don&apos;t see enough in your area?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-gray-300">
            We&apos;re strongest on the East Coast and grow with submissions. Tell us about parties, dungeons, and
            shops worth listing—serious adds help everyone.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href="/contact"
              className="btn-primary min-h-touch inline-flex items-center justify-center px-8"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
