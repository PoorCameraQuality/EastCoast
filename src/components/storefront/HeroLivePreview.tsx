'use client'

import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import {
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
} from '@/lib/kinkSocialMarketing'
import type { StorefrontEvent } from '@/lib/homepageStorefrontData'
import type { HubCategoryCounts } from '@/lib/homeHubCounts'
import { formatEventDatePill } from '@/components/storefront/eventDateBlock'

type Props = {
  featuredEvent: StorefrontEvent | null
  hubCounts: HubCategoryCounts
  upcomingCount: number
  stateHubCount: number
}

export default function HeroLivePreview({
  featuredEvent,
  hubCounts,
  upcomingCount,
  stateHubCount,
}: Props) {
  return (
    <div className="sf-live-panel p-4 sm:p-5">
      <p className="relative z-10 mb-3 text-xs font-medium text-sf-muted">Live discovery</p>

      {featuredEvent ? (
        <Link
          href={`/events/${featuredEvent.slug}`}
          className="relative z-10 mb-4 flex gap-3 rounded-lg border border-white/10 bg-sf-bg/50 p-3 transition-colors hover:border-sf-violet/30"
        >
          {featuredEvent.logo ? (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-sf-elevated">
              <EventLogo src={featuredEvent.logo} alt="" size="small" />
            </div>
          ) : (
            <div className="sf-media-placeholder h-14 w-14 shrink-0" aria-hidden />
          )}
          <div className="min-w-0">
            <span className="sf-date-pill">{formatEventDatePill(featuredEvent.date.start, featuredEvent.date.end, featuredEvent.date.display)}</span>
            <p className="mt-1.5 truncate font-semibold text-sf-strong">{featuredEvent.name}</p>
            <p className="truncate text-xs text-sf-muted">
              {featuredEvent.location.city}, {featuredEvent.location.state}
            </p>
          </div>
        </Link>
      ) : (
        <p className="relative z-10 mb-4 text-sm text-sf-muted">Upcoming events appear here as listings go live.</p>
      )}

      <dl className="relative z-10 mb-4 grid grid-cols-4 gap-2">
        {[
          { n: hubCounts.events, label: 'Events' },
          { n: upcomingCount, label: 'Soon' },
          { n: hubCounts.dungeons, label: 'Spaces' },
          { n: stateHubCount, label: 'Regions' },
        ].map(({ n, label }) => (
          <div key={label} className="rounded-md bg-white/[0.03] px-2 py-2 text-center">
            <dt className="sr-only">{label}</dt>
            <dd className="sf-stat-inline text-base">{n}</dd>
            <dd className="sf-stat-inline-label">{label}</dd>
          </div>
        ))}
      </dl>

      <div className="relative z-10 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <KinkSocialCtaLink
          href={getKinkSocialJoinUrl('home_platform')}
          label="Save on kink.social"
          variant="home"
          surface="home_hero_preview"
          className="sf-btn-rose py-2 text-center text-xs"
          external
        />
        <KinkSocialCtaLink
          href={getKinkSocialOrgUrl('organizer')}
          label="Publish from kink.social"
          variant="organizer"
          surface="home_hero_preview"
          className="sf-btn-ghost py-2 text-center text-xs"
          external
        />
      </div>
    </div>
  )
}
