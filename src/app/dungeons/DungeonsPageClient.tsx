'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonCard from '@/components/dungeons/DungeonCard'
import SwingClubCard from '@/components/swingclubs/SwingClubCard'
import SupportCTAInline from '@/components/SupportCTAInline'
import DirectoryCompactStats from '@/components/discovery/DirectoryCompactStats'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import KinkSocialAcquisitionCard from '@/components/kink-social/KinkSocialAcquisitionCard'

type DungeonRecord = {
  slug: string
  name: string
  location: { city: string; state: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string | null
}

type SwingClubRecord = {
  slug: string
  name: string
  location: { city: string; state: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string | null
}

type EventRecord = { slug: string; name: string; [key: string]: unknown }

type VenueFilter = 'all' | 'dungeons' | 'swing'

type Props = {
  allDungeons: DungeonRecord[]
  allSwingClubs: SwingClubRecord[]
  allEvents: EventRecord[]
}

function normalizeCategory(d: DungeonRecord): string {
  const c = d.category?.trim()
  return c || 'Other / unlabeled'
}

export default function DungeonsPageClient({ allDungeons, allSwingClubs, allEvents }: Props) {
  const [venueFilter, setVenueFilter] = useState<VenueFilter>('all')

  useEffect(() => {
    const h = typeof window !== 'undefined' ? window.location.hash : ''
    if (h === '#swing-clubs') setVenueFilter('swing')
    else if (h === '#dungeons') setVenueFilter('dungeons')
  }, [])

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons & clubs', href: '/dungeons', current: true },
  ]

  const uniqueStates = useMemo(() => {
    const s = new Set<string>()
    for (const d of allDungeons) {
      if (d.location?.state) s.add(d.location.state)
    }
    for (const c of allSwingClubs) {
      if (c.location?.state) s.add(c.location.state)
    }
    return s.size
  }, [allDungeons, allSwingClubs])

  const venueTypeCount = useMemo(() => {
    const s = new Set<string>()
    for (const d of allDungeons) {
      s.add(normalizeCategory(d))
    }
    return s.size
  }, [allDungeons])

  const showDungeons = venueFilter === 'all' || venueFilter === 'dungeons'
  const showSwing = venueFilter === 'all' || venueFilter === 'swing'

  const filterChips: { id: VenueFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'dungeons', label: 'Kink / play spaces' },
    { id: 'swing', label: 'Swing & lifestyle' },
  ]

  return (
    <DiscoveryPageShell accent="violet">
      <section className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mb-4 max-w-3xl md:mb-5">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary-400/90">
              Venues &amp; clubs
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
              Dungeons &amp;{' '}
              <span className="bg-gradient-to-r from-primary-300 via-violet-400 to-primary-500 bg-clip-text text-transparent">
                swing clubs
              </span>
            </h1>
            <p className="mt-3 text-base text-gray-300">
              Kink play spaces and lifestyle clubs—confirm hours and house rules on each venue&apos;s site.
            </p>
            <details className="group mt-3">
              <summary className="flex min-h-touch cursor-pointer list-none items-center text-sm font-medium text-primary-400 underline-offset-2 hover:text-primary-300 hover:underline [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition group-open:rotate-90" aria-hidden>
                  ▶
                </span>
                About these listings
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Listed for discovery, not as endorsements. Pair with{' '}
                <Link href="/events" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  events
                </Link>
                , the{' '}
                <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  calendar
                </Link>
                , and{' '}
                <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  state hubs
                </Link>
                .{' '}
                <Link href="/contact" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  Contact us
                </Link>{' '}
                to add or correct a listing.
              </p>
            </details>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter venue type">
              {filterChips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setVenueFilter(c.id)}
                  className={`discovery-filter-pill ${
                    venueFilter === c.id
                      ? 'discovery-filter-pill-active border-violet-500/40 from-violet-600 via-violet-600 to-violet-700'
                      : ''
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </header>

          {showDungeons ? (
            <section id="dungeons" className="mb-10 scroll-mt-24 md:mb-12">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-3">
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  <span className="text-white">Kink-first </span>
                  <span className="bg-gradient-to-r from-primary-300 to-violet-400 bg-clip-text text-transparent">
                    play spaces
                  </span>
                </h2>
                <p className="text-sm text-gray-500">
                  <span className="tabular-nums">{allDungeons.length}</span> listings
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
                {allDungeons.map((dungeon) => (
                  <DungeonCard key={dungeon.slug} dungeon={dungeon} />
                ))}
              </div>
            </section>
          ) : null}

          {showSwing ? (
            <section id="swing-clubs" className="scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-3">
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  <span className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
                    Swing &amp; lifestyle
                  </span>
                </h2>
                <p className="text-sm text-gray-500">
                  <span className="tabular-nums">{allSwingClubs.length}</span> clubs
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
                {allSwingClubs.map((club) => (
                  <SwingClubCard key={club.slug} club={club} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-10 md:mt-12">
            <KinkSocialAcquisitionCard variant="dungeon" className="mx-auto max-w-3xl lg:max-w-none" />
          </div>

          <div className="stack-ecke-md mt-10 border-t border-white/[0.06] pt-8 md:mt-12">
            <DirectoryCompactStats
              stats={[
                { label: 'kink listings', value: allDungeons.length },
                { label: 'swing clubs', value: allSwingClubs.length, accent: true },
                { label: 'states / DC', value: uniqueStates },
                { label: 'venue types', value: venueTypeCount },
              ]}
            />
            <SupportCTAInline contextLabel="Dungeons & clubs" variant="stack" />
            <div className="mx-auto max-w-2xl">
              <div className="discovery-search-panel">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Search</p>
                <Search
                  compact
                  events={allEvents}
                  dungeons={allDungeons}
                  swingClubs={allSwingClubs}
                  placeholder="Try a city, state, or venue name…"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </DiscoveryPageShell>
  )
}
