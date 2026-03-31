'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonCard from '@/components/dungeons/DungeonCard'
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

type EventRecord = { slug: string; name: string; [key: string]: unknown }

type Props = {
  allDungeons: DungeonRecord[]
  allEvents: EventRecord[]
}

function normalizeCategory(d: DungeonRecord): string {
  const c = d.category?.trim()
  return c || 'Other / unlabeled'
}

export default function DungeonsPageClient({ allDungeons, allEvents }: Props) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons', current: true },
  ]

  const uniqueStates = useMemo(() => {
    const s = new Set<string>()
    for (const d of allDungeons) {
      if (d.location?.state) s.add(d.location.state)
    }
    return s.size
  }, [allDungeons])

  const venueTypeCount = useMemo(() => {
    const s = new Set<string>()
    for (const d of allDungeons) {
      s.add(normalizeCategory(d))
    }
    return s.size
  }, [allDungeons])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-violet-600 blur-3xl" />
        <div className="absolute bottom-32 left-0 h-64 w-64 rounded-full bg-primary-600 blur-3xl" />
      </div>

      <section className="relative z-10 section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <HeroSponsorLayout contextLabel="Dungeons">
            <header className="max-w-3xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">Venues &amp; clubs</p>
              <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Dungeons &amp;{' '}
                <span className="bg-gradient-to-r from-primary-300 via-violet-400 to-primary-500 bg-clip-text text-transparent">
                  play spaces
                </span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
                Member clubs, rental studios, and education-first spaces—listed for discovery, not as endorsements.
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
                  <span className="font-semibold tabular-nums text-white">{allDungeons.length}</span> listings
                </div>
                <div className="rounded-full border border-primary-500/25 bg-primary-500/10 px-4 py-2 text-sm text-primary-100/90">
                  <span className="font-semibold tabular-nums">{uniqueStates}</span> states / DC
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                  <span className="font-semibold tabular-nums text-white">{venueTypeCount}</span> venue types
                </div>
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
                placeholder="Try a city, state, or venue name…"
              />
              <p className="mt-1.5 text-[11px] leading-snug text-gray-600">
                Suggestions include events too—pick a dungeon row to jump straight to its profile.{' '}
                <Link href="/contact" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  Contact us
                </Link>{' '}
                to add or correct a listing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {allDungeons.map((dungeon) => (
              <DungeonCard key={dungeon.slug} dungeon={dungeon} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
