'use client'

import { useMemo, useState } from 'react'
import EckeLink from '@/components/EckeLink'
import Breadcrumb from '@/components/Breadcrumb'
import ActiveLocalHubCard from '@/components/states/hub/ActiveLocalHubCard'
import NationwideOnlineShelf from '@/components/states/hub/NationwideOnlineShelf'
import RecentlyUpdatedFromKinkSocial from '@/components/states/hub/RecentlyUpdatedFromKinkSocial'
import RegionGroupGrid from '@/components/states/hub/RegionGroupGrid'
import StatePublishingCta from '@/components/states/hub/StatePublishingCta'
import StateSponsorCard from '@/components/states/hub/StateSponsorCard'
import type { StateHubContext } from '@/lib/publicStateIndex'

type Props = Pick<
  StateHubContext,
  'summaries' | 'nationwideEvents' | 'nationwideVendors' | 'recentlyUpdated'
>

export default function StateIndexPageClient({
  summaries,
  nationwideEvents,
  nationwideVendors,
  recentlyUpdated,
}: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return summaries
    return summaries.filter(
      (s) =>
        s.info.name.toLowerCase().includes(q) ||
        s.info.abbr.toLowerCase().includes(q) ||
        s.info.region.toLowerCase().includes(q)
    )
  }, [summaries, query])

  const activeHubs = useMemo(
    () => filtered.filter((s) => s.stats.total > 0).slice(0, 6),
    [filtered]
  )

  const totalEvents = summaries.reduce((n, s) => n + s.stats.events + s.stats.conventions, 0)
  const totalPlaces = summaries.reduce((n, s) => n + s.stats.places, 0)
  const activeStates = summaries.filter((s) => s.stats.total > 0).length

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states', current: true },
  ]

  return (
    <div className="st-page">
      <div className="container-custom">
        <Breadcrumb items={breadcrumbItems} />

        <header>
          <p className="st-kicker">Local scene hubs</p>
          <h1 className="st-title">Explore by state</h1>
          <p className="st-subhead">
            Find events, conventions, venues, vendors, education, and public kink.social listings near
            where you live or travel.
          </p>
          <div className="st-stats">
            <span className="st-stat-pill">
              <strong>{totalEvents}</strong> upcoming events
            </span>
            <span className="st-stat-pill">
              <strong>{totalPlaces}</strong> places
            </span>
            <span className="st-stat-pill">
              <strong>{activeStates}</strong> active hubs
            </span>
            <span className="st-stat-pill">
              <strong>{summaries.length}</strong> regions
            </span>
          </div>
          <div className="st-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by state, abbreviation, or region…"
              className="st-search-input"
              aria-label="Search states"
            />
          </div>
        </header>

        <div className="st-layout">
          <div className="st-main">
            <section className="st-section" aria-labelledby="st-chips">
              <h2 id="st-chips" className="st-section-title mb-3">
                Quick state picker
              </h2>
              <div className="st-chip-rail" role="toolbar" aria-label="Top states">
                {filtered.slice(0, 16).map((s) => (
                  <EckeLink key={s.slug} href={`/states/${s.slug}`} className="st-chip">
                    <span className="st-chip-abbr">{s.info.abbr}</span>
                    <span className="hidden sm:inline">{s.info.name}</span>
                    <span className="st-chip-count">{s.stats.total || '—'}</span>
                  </EckeLink>
                ))}
              </div>
            </section>

            {activeHubs.length > 0 ? (
              <section className="st-section" aria-labelledby="st-active-hubs">
                <div className="st-section-head">
                  <h2 id="st-active-hubs" className="st-section-title">
                    Active local hubs
                  </h2>
                  <p className="st-section-note">Destination cards for the busiest regions</p>
                </div>
                <div className="st-hub-grid">
                  {activeHubs.map((summary) => (
                    <ActiveLocalHubCard key={summary.slug} summary={summary} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="st-section" aria-labelledby="st-browse-all">
              <div className="st-section-head">
                <h2 id="st-browse-all" className="st-section-title">
                  Browse all regions
                </h2>
                <p className="st-section-note">{filtered.length} state hubs</p>
              </div>
              <RegionGroupGrid summaries={filtered} />
            </section>

            <NationwideOnlineShelf events={nationwideEvents} vendors={nationwideVendors} />
            <RecentlyUpdatedFromKinkSocial items={recentlyUpdated} />

            <div className="st-section">
              <StatePublishingCta />
            </div>

            <div className="st-mobile-sponsor">
              <StateSponsorCard />
            </div>
          </div>

          <aside className="st-rail" aria-label="States sidebar">
            <div className="st-rail-card">
              <h3 className="st-rail-title">Scene map</h3>
              <p className="st-rail-body">
                Each state hub aggregates events, places, vendors, and education — with kink.social
                publishing feeding local discovery.
              </p>
            </div>
            <StatePublishingCta compact />
            <StateSponsorCard />
          </aside>
        </div>
      </div>
    </div>
  )
}
