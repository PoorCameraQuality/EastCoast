'use client'

import { useState, useEffect, useCallback } from 'react'
import EckeLink from '@/components/EckeLink'
import EventLogo from '@/components/EventLogo'
import DungeonLogo from '@/components/DungeonLogo'
import { useGA4 } from '@/contexts/GA4Provider'
import {
  ECKE_SEARCH_ENTITY_LABELS,
  type EckeSearchEntityType,
  type EckeSearchResult,
} from '@/types/eckeSearchResult'

type Props = {
  searchQuery: string
  maxSuggestions?: number
  stateFilter?: string
  entityType?: EckeSearchEntityType
  showViewAllLink?: boolean
}

function logoForResult(result: EckeSearchResult) {
  if (!result.logoUrl) return null
  if (result.entityType === 'event' || result.entityType === 'convention') {
    return (
      <EventLogo src={result.logoUrl} alt="" size="small" />
    )
  }
  if (result.entityType === 'place' || result.entityType === 'vendor') {
    return (
      <DungeonLogo src={result.logoUrl} alt="" size="small" />
    )
  }
  return null
}

function badgeClass(type: EckeSearchEntityType): string {
  switch (type) {
    case 'event':
    case 'convention':
      return 'text-violet-300 border-violet-500/30 bg-violet-500/10'
    case 'place':
      return 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
    case 'vendor':
      return 'text-rose-300 border-rose-500/30 bg-rose-500/10'
    case 'education':
      return 'text-sky-300 border-sky-500/30 bg-sky-500/10'
    case 'state':
      return 'text-amber-200 border-amber-500/30 bg-amber-500/10'
    default:
      return 'text-gray-300 border-gray-500/30 bg-gray-500/10'
  }
}

export default function SmartSearchSuggestions({
  searchQuery,
  maxSuggestions = 8,
  stateFilter,
  entityType,
  showViewAllLink = true,
}: Props) {
  const [suggestions, setSuggestions] = useState<EckeSearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { trackSearch, trackInternalLinkClick } = useGA4()

  const loadSuggestions = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      setTotal(0)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        limit: String(maxSuggestions),
      })
      if (stateFilter) params.set('state', stateFilter)
      if (entityType) params.set('type', entityType)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (!res.ok) {
        setSuggestions([])
        setTotal(0)
        return
      }

      const data = (await res.json()) as { results: EckeSearchResult[]; total: number }
      setSuggestions(data.results ?? [])
      setTotal(data.total ?? 0)
    } catch (error) {
      console.error('Error loading search suggestions:', error)
      setSuggestions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, maxSuggestions, stateFilter, entityType])

  useEffect(() => {
    const timeoutId = setTimeout(loadSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [loadSuggestions])

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-lg border border-dark-600 bg-dark-800 shadow-xl">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-violet-400" />
            <span className="text-sm text-gray-300">Searching…</span>
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0 || !searchQuery.trim()) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-dark-600 bg-dark-800 shadow-xl">
      <div className="p-2">
        <div className="border-b border-dark-600 px-3 py-2 text-xs text-gray-400">
          {total} result{total === 1 ? '' : 's'} across events, places, vendors, guides, and states
        </div>
        {suggestions.map((suggestion, index) => (
          <EckeLink
            key={suggestion.id}
            href={suggestion.href}
            className="group block rounded-lg p-3 transition-colors hover:bg-dark-700"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setTimeout(() => {
                try {
                  trackSearch({
                    search_term: searchQuery,
                    results_count: total,
                    search_type: 'ecke_search_api',
                    clicked_result: true,
                    result_position: index + 1,
                  })
                  trackInternalLinkClick({
                    from_page: window.location.pathname,
                    to_page: suggestion.href,
                    link_text: suggestion.title,
                    link_type: suggestion.entityType,
                    link_position: 'search_suggestions',
                    content_category: suggestion.category,
                    content_location: suggestion.locationLabel,
                  })
                } catch {
                  /* analytics must not block navigation */
                }
              }, 0)
            }}
          >
            <div className="flex items-center gap-3">
              {logoForResult(suggestion) ? (
                <div className="shrink-0">{logoForResult(suggestion)}</div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium text-white transition-colors group-hover:text-violet-200">
                    {suggestion.title}
                  </h4>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass(suggestion.entityType)}`}
                  >
                    {ECKE_SEARCH_ENTITY_LABELS[suggestion.entityType]}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
                  {suggestion.locationLabel ? <span>{suggestion.locationLabel}</span> : null}
                  {suggestion.dateDisplay ? <span>· {suggestion.dateDisplay}</span> : null}
                  {suggestion.category ? <span>· {suggestion.category}</span> : null}
                  {suggestion.sourceSystem === 'kink_social' ? (
                    <span className="text-rose-300/90">· kink.social</span>
                  ) : null}
                </div>
              </div>
            </div>
          </EckeLink>
        ))}

        {showViewAllLink ? (
          <div className="mt-2 border-t border-dark-600">
            <EckeLink
              href={`/search?q=${encodeURIComponent(searchQuery)}`}
              className="block p-3 text-center text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
            >
              View all results for &ldquo;{searchQuery}&rdquo; →
            </EckeLink>
          </div>
        ) : null}
      </div>
    </div>
  )
}
