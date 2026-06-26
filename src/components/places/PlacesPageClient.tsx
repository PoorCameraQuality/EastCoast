'use client'

import { useMemo, useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import AdaptivePlaceCard, { PlaceOwnerCta } from '@/components/places/AdaptivePlaceCard'
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

export default function PlacesPageClient({
  places,
  searchEvents,
  searchDungeons,
  searchSwingClubs,
}: Props) {
  const [intent, setIntent] = useState<PlaceListIntent>('all')

  const counts = useMemo(() => placeIntentCounts(places), [places])

  const intentOptions = useMemo(
    () => PLACE_INTENT_OPTIONS.filter((opt) => opt.id === 'all' || (counts[opt.id] ?? 0) > 0),
    [counts]
  )

  const filtered = useMemo(() => {
    return places.filter((p) => matchesPlaceIntent(p, intent))
  }, [places, intent])

  const featured = useMemo(() => {
    if (intent !== 'all') return []
    return pickFeaturedPlaces(places, 3)
  }, [places, intent])

  const featuredSlugs = useMemo(() => new Set(featured.map((f) => f.slug)), [featured])

  const listing = useMemo(
    () => filtered.filter((p) => !featuredSlugs.has(p.slug)),
    [filtered, featuredSlugs]
  )

  const dungeonSection = useMemo(
    () => listing.filter((p) => p.placeType === 'dungeon' || p.routeKind === 'dungeon'),
    [listing]
  )
  const swingSection = useMemo(
    () => listing.filter((p) => p.placeType === 'swing_lifestyle_club'),
    [listing]
  )
  const otherSection = useMemo(
    () =>
      listing.filter(
        (p) =>
          p.placeType !== 'dungeon' &&
          p.routeKind !== 'dungeon' &&
          p.placeType !== 'swing_lifestyle_club'
      ),
    [listing]
  )

  const kinkSocialUpdated = useMemo(
    () =>
      places
        .filter((p) => p.sourceSystem === 'kink_social')
        .sort((a, b) => (b.lastSyncedAt ?? '').localeCompare(a.lastSyncedAt ?? ''))
        .slice(0, 3),
    [places]
  )

  const withEvents = useMemo(
    () => places.filter((p) => (p.upcomingEventCount ?? 0) > 0).slice(0, 6),
    [places]
  )

  const showGrouped = intent === 'all'

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Places', href: '/dungeons', current: true },
  ]

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
            These are the spaces where the scene actually happens — confirm access and house rules on each venue&apos;s
            official site before you go.
          </p>
          <div className="places-index-search">
            <Search
              compact
              events={searchEvents}
              dungeons={searchDungeons}
              swingClubs={searchSwingClubs}
              placeholder="Search by name, city, or state…"
            />
          </div>
        </header>

        <div className="places-intent-rail" role="toolbar" aria-label="Place filters">
          {intentOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={intent === opt.id ? 'places-intent-pill places-intent-pill-active' : 'places-intent-pill'}
              onClick={() => setIntent(opt.id)}
            >
              {opt.label}
              {opt.id !== 'all' && counts[opt.id] ? (
                <span className="places-intent-count">{counts[opt.id]}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="places-layout">
          <div className="places-main">
            {filtered.length === 0 ? (
              <div className="places-empty">
                <p>No places found for this view.</p>
                <button type="button" className="place-btn place-btn-view" onClick={() => setIntent('all')}>
                  Show all places
                </button>
              </div>
            ) : (
              <>
                {featured.length > 0 ? (
                  <section className="places-section" aria-label="Featured spaces">
                    <h2 className="places-section-title">Featured spaces</h2>
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

                    {kinkSocialUpdated.length > 0 ? (
                      <section className="places-section">
                        <h2 className="places-section-title">Recently updated from kink.social</h2>
                        <div className="places-grid">
                          {kinkSocialUpdated.map((place) => (
                            <AdaptivePlaceCard key={`ks-${place.slug}`} place={place} />
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

            <div className="places-mobile-owner lg:hidden">
              <PlaceOwnerCta compact />
            </div>
          </div>

          <aside className="places-rail" aria-label="Places sidebar">
            <div className="places-rail-card">
              <h3 className="places-rail-title">{places.length} places</h3>
              <p className="places-rail-body">Evergreen venue profiles across the directory and kink.social listings.</p>
            </div>
            <PlaceOwnerCta compact />
            <CalendarSponsorCard />
          </aside>
        </div>
      </div>
    </main>
  )
}
