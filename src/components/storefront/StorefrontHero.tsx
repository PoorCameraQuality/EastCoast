'use client'

import EckeLink from '@/components/EckeLink'
import { useState } from 'react'
import Search from '@/components/Search'
import FeaturedEventShowcase from '@/components/storefront/FeaturedEventShowcase'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  getKinkSocialJoinUrl,
  KINK_SOCIAL_LABELS,
} from '@/lib/kinkSocialMarketing'
import type { StorefrontEvent } from '@/lib/homepageStorefrontData'

const QUICK_CHIPS = [
  { label: 'This weekend', href: '/events?when=weekend' },
  { label: 'Pennsylvania', href: '/states/pennsylvania' },
  { label: 'Conventions', href: '/events?tag=convention' },
  { label: 'Dungeons', href: '/dungeons' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Education', href: '/education' },
] as const

type Props = {
  featuredEvent: StorefrontEvent | null
  searchEvents: Parameters<typeof Search>[0]['events']
  searchDungeons: Parameters<typeof Search>[0]['dungeons']
}

export default function StorefrontHero({ featuredEvent, searchEvents, searchDungeons }: Props) {
  const [activeChip, setActiveChip] = useState<string | null>(null)

  return (
    <section
      className="relative overflow-hidden pb-ecke-6 pt-ecke-5 md:pb-ecke-10 md:pt-ecke-8"
      aria-labelledby="storefront-hero-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-0 h-[32rem] w-[32rem] -translate-x-1/3 rounded-full bg-sf-violet/8 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <p className="sf-kicker">The public map to kink community</p>
            <h1
              id="storefront-hero-title"
              className="mt-2 font-sans text-4xl font-bold tracking-tight text-sf-strong sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
            >
              East Coast Kink Events
            </h1>
            <p className="mt-4 text-base leading-relaxed text-sf-body md:text-lg">
              Discover where the scene is showing up — then save, follow, and connect on kink.social when you
              are ready.
            </p>

            <div className="storefront-search mt-6">
              <Search
                events={searchEvents}
                dungeons={searchDungeons}
                placeholder="Search events, cities, states, venues, vendors…"
                compact
              />
            </div>

            <div className="sf-chip-row mt-4" aria-label="Quick browse">
              {QUICK_CHIPS.map((chip) => (
                <EckeLink
                  key={chip.label}
                  href={chip.href}
                  className={`sf-chip ${activeChip === chip.label ? 'border-sf-violet/40 bg-sf-violet/10 text-sf-strong' : ''}`}
                  onClick={() => setActiveChip(chip.label)}
                >
                  {chip.label}
                </EckeLink>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <EckeLink href="/events" className="sf-btn-primary">
                Browse events
              </EckeLink>
              <EckeLink href="/calendar" className="sf-btn-ghost">
                Open calendar
              </EckeLink>
              <KinkSocialCtaLink
                href={getKinkSocialJoinUrl('home_platform')}
                label={KINK_SOCIAL_LABELS.joinFree}
                variant="home"
                surface="home_hero"
                className="sf-btn-rose"
                external
              />
            </div>
          </div>

          <div className="w-full">
            {featuredEvent ? (
              <FeaturedEventShowcase event={featuredEvent} />
            ) : (
              <div className="rounded-xl border border-white/10 bg-sf-card p-8 text-center">
                <p className="text-sm text-sf-muted">Upcoming events appear here as listings go live.</p>
                <EckeLink href="/events" className="sf-btn-primary mt-4 inline-flex">
                  Browse events
                </EckeLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
