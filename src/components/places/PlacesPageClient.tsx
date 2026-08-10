'use client'

import { useMemo, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import AdaptivePlaceCard from '@/components/places/AdaptivePlaceCard'
import CalendarSponsorCard from '@/components/calendar/CalendarSponsorCard'
import {
  matchesPlaceIntent,
  pickFeaturedPlaces,
  placeIntentCounts,
} from '@/lib/publicPlaceIndex'
import { PLACE_INTENT_OPTIONS, type PlaceListIntent } from '@/types/publicPlaceListing'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type SearchEvent = { slug: string; name: string; [key: string]: unknown }

type Props = {
  places: PublicPlaceListing[]
  searchEvents: SearchEvent[]
  searchDungeons: Array<{ slug: string; name: string; location: { city: string; state: string }; logo?: string }>
  searchSwingClubs: Array<{ slug: string; name: string; location: { city: string; state: string }; logo?: string }>
}

type StateOption = {
  code: string
  count: number
}

function matchesPlaceSearch(place: PublicPlaceListing, query: string): boolean {
  if (!query) return true
  const haystack = `${place.name} ${place.city}`.toLowerCase()
  return haystack.includes(query)
}

export default function PlacesPageClient({ places }: Props) {
  const [intent, setIntent] = useState<PlaceListIntent>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState('')

  const counts = useMemo(() => placeIntentCounts(places), [places])

  const intentOptions = useMemo(
    () => PLACE_INTENT_OPTIONS.filter((opt) => opt.id === 'all' || (counts[opt.id] ?? 0) > 0),
    [counts]
  )

  const stateOptions = useMemo(() => {
    const byState = new Map<string, number>()
    for (const place of places) {
      const code = place.state?.trim()
      if (!code) continue
      byState.set(code, (byState.get(code) ?? 0) + 1)
    }
    return Array.from(byState.entries())
      .map(([code, count]) => ({ code, count }) satisfies StateOption)
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
  }, [places])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filtered = useMemo(() => {
    return places.filter((place) => {
      if (!matchesPlaceIntent(place, intent)) return false
      if (selectedState && place.state !== selectedState) return false
      if (!matchesPlaceSearch(place, normalizedQuery)) return false
      return true
    })
  }, [places, intent, selectedState, normalizedQuery])

  const featured = useMemo(() => {
    if (intent !== 'all' || selectedState || normalizedQuery) return []
    return pickFeaturedPlaces(places, 3)
  }, [places, intent, selectedState, normalizedQuery])

  const featuredSlugs = useMemo(() => new Set(featured.map((place) => place.slug)), [featured])

  const listing = useMemo(
    () => filtered.filter((place) => !featuredSlugs.has(place.slug)),
    [filtered, featuredSlugs]
  )

  const dungeonSection = useMemo(
    () => listing.filter((place) => place.placeType === 'dungeon' || place.routeKind === 'dungeon'),
    [listing]
  )
  const swingSection = useMemo(
    () => listing.filter((place) => place.placeType === 'swing_lifestyle_club'),
    [listing]
  )
  const otherSection = useMemo(
    () =>
      listing.filter(
        (place) =>
          place.placeType !== 'dungeon' &&
          place.routeKind !== 'dungeon' &&
          place.placeType !== 'swing_lifestyle_club'
      ),
    [listing]
  )

  const withEvents = useMemo(
    () =>
      filtered
        .filter((place) => (place.upcomingEventCount ?? 0) > 0 && !featuredSlugs.has(place.slug))
        .slice(0, 6),
    [filtered, featuredSlugs]
  )

  const showGrouped = intent === 'all' && !selectedState && !normalizedQuery

  const intentLabel = PLACE_INTENT_OPTIONS.find((option) => option.id === intent)?.label ?? 'All'

  const resultCountLabel = (() => {
    const count = filtered.length
    const noun = count === 1 ? 'place' : 'places'
    let label = `Showing ${count} ${noun}`
    if (normalizedQuery) label += ` for “${searchQuery.trim()}”`
    if (intent !== 'all') label += ` in ${intentLabel}`
    if (selectedState) label += ` · ${selectedState}`
    if (intent === 'events-this-month') {
      const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
      label = `Showing ${count} ${noun} with events in ${monthLabel}`
      if (normalizedQuery) label += ` matching “${searchQuery.trim()}”`
      if (selectedState) label += ` · ${selectedState}`
    }
    return label
  })()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Places', href: '/dungeons', current: true },
  ]

  const resetFilters = () => {
    setIntent('all')
    setSearchQuery('')
    setSelectedState('')
  }

  return (
    <main className="places-index-page">
      <div className="container-custom section-padding">
        <Breadcrumb items={breadcrumbItems} />

        <header className="places-index-hero">
          <p className="places-index-kicker">Destinations</p>
          <h1 className="places-index-title">Places</h1>
          <p className="places-index-subhead">
            Dungeons, clubs, studios, venues, and community spaces.
          </p>
          <p className="places-index-support">
            These are the spaces where the scene actually happens — confirm access and house rules on each
            venue&apos;s official site before you go.
          </p>

          <div className="places-filter-controls">
            <div className="places-intent-rail hidden md:flex" role="toolbar" aria-label="Place filters">
              {intentOptions.map((option) => {
                const isActive = intent === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={
                      isActive ? 'places-intent-tab places-intent-tab-active' : 'places-intent-tab'
                    }
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => setIntent(option.id)}
                  >
                    {option.label}
                    {option.id !== 'all' && counts[option.id] ? (
                      <span className="places-intent-count">{counts[option.id]}</span>
                    ) : option.id === 'all' ? (
                      <span className="places-intent-count">{places.length}</span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            <div className="places-mobile-filters md:hidden">
              <label className="sr-only" htmlFor="places-intent-select">
                Filter by category
              </label>
              <select
                id="places-intent-select"
                className="places-filter-select"
                value={intent}
                onChange={(event) => setIntent(event.target.value as PlaceListIntent)}
              >
                {intentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                    {option.id !== 'all' && counts[option.id] ? ` (${counts[option.id]})` : ` (${places.length})`}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="places-state-select-mobile">
                Filter by state
              </label>
              <select
                id="places-state-select-mobile"
                className="places-filter-select"
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
              >
                <option value="">All states</option>
                {stateOptions.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.code} ({state.count})
                  </option>
                ))}
              </select>
            </div>

            <label className="sr-only" htmlFor="places-list-search">
              Search places by name or city
            </label>
            <input
              id="places-list-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search dungeons by name or city…"
              className="places-list-search-input"
              aria-label="Search places by name or city"
            />

            <div className="places-state-rail hidden md:flex" role="toolbar" aria-label="Filter by state">
              <button
                type="button"
                className={
                  selectedState === ''
                    ? 'places-state-chip places-state-chip-active'
                    : 'places-state-chip'
                }
                onClick={() => setSelectedState('')}
              >
                All states
              </button>
              {stateOptions.slice(0, 12).map((state) => (
                <button
                  key={state.code}
                  type="button"
                  className={
                    selectedState === state.code
                      ? 'places-state-chip places-state-chip-active'
                      : 'places-state-chip'
                  }
                  onClick={() => setSelectedState(state.code)}
                >
                  {state.code}
                  <span className="places-intent-count">{state.count}</span>
                </button>
              ))}
            </div>

            <p className="places-result-count" aria-live="polite">
              {resultCountLabel}
            </p>
          </div>
        </header>

        <div className="places-layout">
          <div className="places-main">
            {filtered.length === 0 ? (
              <div className="places-empty">
                <p>No places found for this view.</p>
                <button type="button" className="place-btn place-btn-view min-h-11" onClick={resetFilters}>
                  Show all places
                </button>
              </div>
            ) : (
              <>
                {featured.length > 0 ? (
                  <section className="places-section" aria-labelledby="places-featured-title">
                    <h2 id="places-featured-title" className="places-section-title">
                      Featured spaces
                    </h2>
                    <p className="places-section-note">
                      Community-verified venues with active events
                    </p>
                    <div className="places-grid places-grid-featured">
                      {featured.map((place) => (
                        <AdaptivePlaceCard key={place.slug} place={place} variant="featured" />
                      ))}
                    </div>
                  </section>
                ) : null}

                {showGrouped ? (
                  <>
                    {dungeonSection.length > 0 ? (
                      <section id="dungeons" className="places-section scroll-mt-24">
                        <h2 className="places-section-title">Dungeons and play spaces</h2>
                        <div className="places-grid">
                          {dungeonSection.map((place) => (
                            <AdaptivePlaceCard key={place.slug} place={place} />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {swingSection.length > 0 ? (
                      <section id="swing-clubs" className="places-section scroll-mt-24">
                        <h2 className="places-section-title">Swing and lifestyle clubs</h2>
                        <div className="places-grid">
                          {swingSection.map((place) => (
                            <AdaptivePlaceCard key={place.slug} place={place} />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {otherSection.length > 0 ? (
                      <section className="places-section">
                        <h2 className="places-section-title">Education and community spaces</h2>
                        <div className="places-grid">
                          {otherSection.map((place) => (
                            <AdaptivePlaceCard key={place.slug} place={place} />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {withEvents.length > 0 ? (
                      <section className="places-section">
                        <h2 className="places-section-title">Spaces with upcoming events</h2>
                        <div className="places-grid">
                          {withEvents.map((place) => (
                            <AdaptivePlaceCard key={`ev-${place.slug}`} place={place} />
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </>
                ) : (
                  <section className="places-section">
                    <div className="places-grid">
                      {listing.map((place) => (
                        <AdaptivePlaceCard key={place.slug} place={place} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          <aside className="places-rail" aria-label="Places sidebar">
            <div className="places-rail-card">
              <h3 className="places-rail-title">{filtered.length} places</h3>
              <p className="places-rail-body">
                Evergreen venue profiles across the directory and kink.social listings.
              </p>
            </div>
            <CalendarSponsorCard />
          </aside>
        </div>
      </div>
    </main>
  )
}
