'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonCard from '@/components/dungeons/DungeonCard'
import SwingClubCard from '@/components/swingclubs/SwingClubCard'
import HeroSponsorLayout from '@/components/HeroSponsorLayout'

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
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-violet-600 blur-3xl" />
        <div className="absolute bottom-32 left-0 h-64 w-64 rounded-full bg-primary-600 blur-3xl" />
      </div>

      <section className="relative z-10 section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <HeroSponsorLayout contextLabel="Dungeons & clubs">
            <header className="max-w-3xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">Venues &amp; clubs</p>
              <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Dungeons &amp;{' '}
                <span className="bg-gradient-to-r from-primary-300 via-violet-400 to-primary-500 bg-clip-text text-transparent">
                  swing clubs
                </span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
                Kink-first play spaces and swing &amp; lifestyle clubs—listed for discovery, not as endorsements.
                Always confirm hours, vetting, and house rules on the venue&apos;s site before you travel. Pair listings
                with{' '}
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
                .
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                  <span className="font-semibold tabular-nums text-white">{allDungeons.length}</span> kink listings
                </div>
                <div className="rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm text-violet-100/90">
                  <span className="font-semibold tabular-nums text-white">{allSwingClubs.length}</span> swing clubs
                </div>
                <div className="rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2 text-sm text-primary-100/90">
                  <span className="font-semibold tabular-nums">{uniqueStates}</span> states / DC
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                  <span className="font-semibold tabular-nums text-white">{venueTypeCount}</span> dungeon venue types
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter venue type">
                {filterChips.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setVenueFilter(c.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      venueFilter === c.id
                        ? 'border-violet-500/50 bg-violet-500/20 text-white'
                        : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </header>
          </HeroSponsorLayout>

          <div className="mx-auto mb-6 max-w-2xl">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-3 shadow-md sm:p-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">Search</p>
              <Search
                compact
                events={allEvents}
                dungeons={allDungeons}
                swingClubs={allSwingClubs}
                placeholder="Try a city, state, or venue name…"
              />
              <p className="mt-1.5 text-[11px] leading-snug text-gray-600">
                Suggestions include events and swing club rows—pick a result to open its profile.{' '}
                <Link href="/contact" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  Contact us
                </Link>{' '}
                to add or correct a listing.
              </p>
            </div>
          </div>

          {showDungeons ? (
            <section id="dungeons" className="mb-14 scroll-mt-24">
              <div className="mb-6 border-b border-white/10 pb-4">
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">Kink-first / play spaces</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-400 sm:text-base">
                  Member clubs, rental studios, and education-first spaces.{' '}
                  <a href="#swing-clubs" className="text-social underline underline-offset-2 hover:text-social-hover">
                    Jump to swing &amp; lifestyle clubs
                  </a>
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
                {allDungeons.map((dungeon) => (
                  <DungeonCard key={dungeon.slug} dungeon={dungeon} />
                ))}
              </div>
            </section>
          ) : null}

          {showSwing ? (
            <section id="swing-clubs" className="scroll-mt-24">
              <div className="mb-6 border-b border-white/10 pb-4">
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">Swing &amp; lifestyle clubs</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-400 sm:text-base">
                  On-premise and off-premise lifestyle venues (separate from kink dungeon listings; overlap venues are
                  listed under dungeons only).{' '}
                  <a href="#dungeons" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                    Jump to kink / play spaces
                  </a>
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
                {allSwingClubs.map((club) => (
                  <SwingClubCard key={club.slug} club={club} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}
