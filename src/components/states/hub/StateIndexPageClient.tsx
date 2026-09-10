'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import Breadcrumb from '@/components/Breadcrumb'
import ActiveLocalHubCard from '@/components/states/hub/ActiveLocalHubCard'
import NationwideOnlineShelf from '@/components/states/hub/NationwideOnlineShelf'
import RegionGroupGrid from '@/components/states/hub/RegionGroupGrid'
import type { StateHubContext } from '@/lib/publicStateIndex'

type Props = Pick<
  StateHubContext,
  'summaries' | 'nationwideEvents' | 'nationwideVendors' | 'recentlyUpdated'
>

export default function StateIndexPageClient({
  summaries,
  nationwideEvents,
  nationwideVendors,
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return summaries
    return summaries.filter(
      (summary) =>
        summary.info.name.toLowerCase().includes(normalizedQuery) ||
        summary.info.abbr.toLowerCase().includes(normalizedQuery) ||
        summary.info.region.toLowerCase().includes(normalizedQuery)
    )
  }, [summaries, query])

  const topStates = useMemo(() => summaries.slice(0, 16), [summaries])

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []
    return filtered.slice(0, 8)
  }, [filtered, query])

  const activeHubs = useMemo(
    () => filtered.filter((summary) => summary.stats.total > 0).slice(0, 6),
    [filtered]
  )

  const totalEvents = summaries.reduce(
    (count, summary) => count + summary.stats.events + summary.stats.conventions,
    0
  )
  const totalPlaces = summaries.reduce((count, summary) => count + summary.stats.places, 0)
  const activeStates = summaries.filter((summary) => summary.stats.total > 0).length

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states', current: true },
  ]

  const jumpToState = (slug: string) => {
    setQuery('')
    router.push(`/states/${slug}`)
  }

  return (
    <div className="st-page">
      <div className="container-custom">
        <Breadcrumb items={breadcrumbItems} />

        <header>
          <p className="st-kicker">Local scene hubs</p>
          <h1 className="st-title">Explore by state</h1>
          <p className="st-subhead">
            Find events, conventions, venues, vendors, education, and public listings near
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
            <label className="sr-only" htmlFor="states-list-search">
              Find your state
            </label>
            <input
              id="states-list-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find your state (e.g., 'Montana', 'MT')…"
              className="st-search-input"
              aria-label="Find your state"
              aria-controls="states-search-results"
              autoComplete="off"
            />
            {searchResults.length > 0 ? (
              <ul id="states-search-results" className="st-search-results" role="listbox">
                {searchResults.map((summary) => (
                  <li key={summary.slug}>
                    <button
                      type="button"
                      className="st-search-result"
                      onClick={() => jumpToState(summary.slug)}
                    >
                      <span className="st-search-result-main">
                        {summary.info.abbr} · {summary.info.name}
                      </span>
                      <span className="st-search-result-count">
                        {summary.stats.total > 0
                          ? `${summary.stats.total} listings`
                          : 'Growing hub'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {query.trim() && searchResults.length === 0 ? (
              <p className="st-search-empty">No states match “{query.trim()}”.</p>
            ) : null}
          </div>
        </header>

        <div className="st-layout st-layout-full">
          <div className="st-main">
            <section className="st-section" aria-labelledby="st-chips">
              <h2 id="st-chips" className="st-section-title mb-3">
                Quick state picker
              </h2>

              <div className="md:hidden">
                <label className="sr-only" htmlFor="states-quick-select">
                  Jump to top state
                </label>
                <select
                  id="states-quick-select"
                  className="st-quick-select"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) jumpToState(event.target.value)
                  }}
                >
                  <option value="">Jump to top state…</option>
                  {topStates.map((summary) => (
                    <option key={summary.slug} value={summary.slug}>
                      {summary.info.name} ({summary.stats.total || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="st-chip-rail hidden md:flex" role="toolbar" aria-label="Top states">
                {topStates.map((summary) => (
                  <EckeLink
                    key={summary.slug}
                    href={`/states/${summary.slug}`}
                    className="st-chip min-h-11"
                  >
                    <span className="st-chip-abbr">{summary.info.abbr}</span>
                    <span className="hidden sm:inline">{summary.info.name}</span>
                    <span className="st-chip-count">{summary.stats.total || '—'}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
