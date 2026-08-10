'use client'

import EckeLink from '@/components/EckeLink'
import { useState } from 'react'
import Search from '@/components/Search'
import { buildEventsListUrl } from '@/lib/eventsListSearchParams'

const QUICK_FILTERS = [
  { label: 'Upcoming', href: buildEventsListUrl('all') },
  { label: 'This weekend', href: buildEventsListUrl('this-weekend') },
  { label: 'Pennsylvania', href: '/states/pennsylvania' },
  { label: 'Conventions', href: '/events?tag=convention' },
  { label: 'Dungeons', href: '/dungeons' },
] as const

type Props = {
  searchEvents: Parameters<typeof Search>[0]['events']
  searchDungeons: Parameters<typeof Search>[0]['dungeons']
}

export default function StorefrontHero({ searchEvents, searchDungeons }: Props) {
  const [activeFilter, setActiveFilter] = useState('Upcoming')

  return (
    <section
      className="relative overflow-hidden pb-ecke-5 pt-ecke-5 md:pb-ecke-8 md:pt-ecke-7"
      aria-labelledby="storefront-hero-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-0 h-[28rem] w-[28rem] -translate-x-1/3 rounded-full bg-sf-violet/8 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-3xl text-center md:text-left">
          <h1
            id="storefront-hero-title"
            className="font-sans text-3xl font-bold tracking-tight text-sf-strong sm:text-4xl md:text-5xl md:leading-[1.1]"
          >
            What&apos;s happening next
          </h1>

          <div className="storefront-search mt-5">
            <Search
              events={searchEvents}
              dungeons={searchDungeons}
              placeholder="Search events, cities, states, venues…"
              compact
            />
          </div>

          <div className="sf-chip-row mt-4 justify-center md:justify-start" aria-label="Quick filters">
            {QUICK_FILTERS.map((filter) => (
              <EckeLink
                key={filter.label}
                href={filter.href}
                className={`sf-chip min-h-11 px-4 py-2.5 ${
                  activeFilter === filter.label
                    ? 'border-sf-violet/40 bg-sf-violet/10 text-sf-strong'
                    : ''
                }`}
                onClick={() => setActiveFilter(filter.label)}
                aria-current={activeFilter === filter.label ? 'true' : undefined}
              >
                {filter.label}
              </EckeLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
