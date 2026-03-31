'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonSubmissionForm from '@/components/dungeons/DungeonSubmissionForm'
import DungeonCard from '@/components/dungeons/DungeonCard'
import SupportCTAInline from '@/components/SupportCTAInline'

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
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

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

  const categoryOptions = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of allDungeons) {
      const c = normalizeCategory(d)
      m.set(c, (m.get(c) || 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [allDungeons])

  const filteredDungeons = useMemo(() => {
    if (categoryFilter === 'all') return allDungeons
    return allDungeons.filter((d) => normalizeCategory(d) === categoryFilter)
  }, [allDungeons, categoryFilter])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-violet-600 blur-3xl" />
        <div className="absolute bottom-32 left-0 h-64 w-64 rounded-full bg-primary-600 blur-3xl" />
      </div>

      <section className="relative z-10 section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <SupportCTAInline contextLabel="Dungeons" />

          <header className="mx-auto mb-10 max-w-3xl md:mb-12">
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
                <span className="font-semibold tabular-nums text-white">{categoryOptions.length}</span> venue types
              </div>
            </div>
          </header>

          <div className="mx-auto mb-8 max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-lg sm:p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Search</p>
              <Search
                events={allEvents}
                dungeons={allDungeons}
                placeholder="Try a city, state, or venue name…"
              />
              <p className="mt-3 text-xs text-gray-600">
                Suggestions include events too—pick a dungeon row to jump straight to its profile.
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
            <button
              type="button"
              onClick={() => setShowSubmitForm((v) => !v)}
              className={`min-h-touch rounded-xl border-2 px-6 py-3 text-sm font-semibold transition sm:min-w-[14rem] ${
                showSubmitForm
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'btn-outline border-primary-500/40 text-primary-100 hover:border-primary-400'
              }`}
              aria-expanded={showSubmitForm}
              aria-controls="dungeon-submission-form"
            >
              {showSubmitForm ? 'Close submission form' : 'Add or update a listing'}
            </button>
            <Link
              href="/contact"
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              Contact directory editors
            </Link>
          </div>

          {showSubmitForm && (
            <div id="dungeon-submission-form" className="mx-auto mb-12 max-w-3xl">
              <div className="rounded-2xl border border-primary-500/20 bg-black/50 p-6 sm:p-8">
                <h2 className="font-serif text-lg font-semibold text-white">Submit a dungeon or club</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Help keep the directory accurate—include public URLs and anything you&apos;re comfortable sharing.
                </p>
                <div className="mt-6">
                  <DungeonSubmissionForm />
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">Browse by venue type</h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium text-gray-300">{filteredDungeons.length}</span> of{' '}
                <span className="tabular-nums text-gray-400">{allDungeons.length}</span>
              </p>
            </div>
            {categoryFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className="self-start text-sm font-medium text-primary-400 underline underline-offset-2 hover:text-primary-300"
              >
                Clear type filter
              </button>
            ) : null}
          </div>

          <div className="-mx-4 mb-10 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:gap-3 md:overflow-visible md:px-0">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`shrink-0 snap-start rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition ${
                categoryFilter === 'all'
                  ? 'border-white/35 bg-white/15 text-white shadow-md'
                  : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-white/25'
              }`}
            >
              All types
            </button>
            {categoryOptions.map(([label, count]) => (
              <button
                key={label}
                type="button"
                onClick={() => setCategoryFilter(label)}
                className={`shrink-0 snap-start rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition ${
                  categoryFilter === label
                    ? 'border-primary-400 bg-primary-600/40 text-white shadow-md shadow-primary-900/20'
                    : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-primary-500/35'
                }`}
              >
                {label}{' '}
                <span className="tabular-nums text-gray-400">({count})</span>
              </button>
            ))}
          </div>

          {filteredDungeons.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center text-gray-400">
              No listings in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {filteredDungeons.map((dungeon) => (
                <DungeonCard key={dungeon.slug} dungeon={dungeon} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
