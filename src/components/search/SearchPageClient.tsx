'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import Breadcrumb from '@/components/Breadcrumb'
import EventLogo from '@/components/EventLogo'
import DungeonLogo from '@/components/DungeonLogo'
import {
  ECKE_SEARCH_ENTITY_LABELS,
  type EckeSearchEntityType,
  type EckeSearchResult,
} from '@/types/eckeSearchResult'

function SearchResultsInner() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const [results, setResults] = useState<EckeSearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setTotal(0)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=25`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setResults(data.results ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(() => {
        if (!cancelled) {
          setResults([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query])

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Home', href: '/' },
      {
        label: 'Search',
        href: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
        current: true,
      },
    ],
    [query]
  )

  return (
    <div className="st-page">
      <div className="container-custom">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-6 max-w-2xl">
          <p className="st-kicker">Discovery</p>
          <h1 className="st-title">Search</h1>
          {query ? (
            <p className="st-subhead">
              {loading
                ? `Searching for “${query}”…`
                : `${total} result${total === 1 ? '' : 's'} for “${query}”`}
            </p>
          ) : (
            <p className="st-subhead">
              Enter at least two characters in the search box on the homepage or directory pages.
            </p>
          )}
        </header>

        {!query || query.length < 2 ? (
          <div className="st-empty max-w-xl">
            Try searching for a city, state, event, venue, vendor, or topic like &ldquo;rope&rdquo; or
            &ldquo;consent&rdquo;.
          </div>
        ) : loading ? (
          <div className="st-empty max-w-xl">Loading results…</div>
        ) : results.length === 0 ? (
          <div className="st-empty max-w-xl">
            No matches yet. Browse{' '}
            <EckeLink href="/events" className="text-violet-300 underline">
              events
            </EckeLink>
            ,{' '}
            <EckeLink href="/dungeons" className="text-violet-300 underline">
              places
            </EckeLink>
            , or{' '}
            <EckeLink href="/education" className="text-violet-300 underline">
              guides
            </EckeLink>
            .
          </div>
        ) : (
          <ul className="max-w-3xl space-y-2">
            {results.map((result) => (
              <li key={result.id}>
                <EckeLink href={result.href} className="st-listing-row block">
                  <div className="flex items-center gap-3">
                    {result.logoUrl &&
                    (result.entityType === 'event' || result.entityType === 'convention') ? (
                      <EventLogo src={result.logoUrl} alt="" size="small" />
                    ) : result.logoUrl &&
                      (result.entityType === 'place' || result.entityType === 'vendor') ? (
                      <DungeonLogo src={result.logoUrl} alt="" size="small" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="st-listing-title">{result.title}</p>
                      <p className="st-listing-meta">
                        {ECKE_SEARCH_ENTITY_LABELS[result.entityType as EckeSearchEntityType]}
                        {result.locationLabel ? ` · ${result.locationLabel}` : ''}
                        {result.dateDisplay ? ` · ${result.dateDisplay}` : ''}
                      </p>
                    </div>
                  </div>
                </EckeLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function SearchPageClient() {
  return (
    <Suspense
      fallback={
        <div className="st-page">
          <div className="container-custom st-empty">Loading search…</div>
        </div>
      }
    >
      <SearchResultsInner />
    </Suspense>
  )
}
