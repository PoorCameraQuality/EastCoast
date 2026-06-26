'use client'

import { useState, useEffect } from 'react'
import SmartSearchSuggestions from '@/components/SmartSearchSuggestions'
import type { EckeSearchEntityType } from '@/types/eckeSearchResult'

type SearchProps = {
  /** @deprecated Search now uses /api/search; props ignored for backward compatibility */
  events?: unknown[]
  /** @deprecated Search now uses /api/search; props ignored for backward compatibility */
  dungeons?: unknown[]
  /** @deprecated Search now uses /api/search; props ignored for backward compatibility */
  swingClubs?: unknown[]
  placeholder?: string
  compact?: boolean
  stateFilter?: string
  entityType?: EckeSearchEntityType
}

export default function Search({
  placeholder = 'Search events, places, vendors, guides, states…',
  compact = false,
  stateFilter,
  entityType,
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setIsSearching(debouncedQuery.length >= 2 && searchFocused)
  }, [debouncedQuery, searchFocused])

  const suggestionsOpen = searchFocused && query.length >= 2

  return (
    <div className="relative z-10">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setSearchFocused(false)
              setIsSearching(false)
            }, 200)
          }}
          placeholder={placeholder}
          role="combobox"
          aria-label="Search ECKE"
          aria-autocomplete="list"
          aria-expanded={suggestionsOpen}
          aria-controls="search-smart-suggestions"
          className={
            compact
              ? 'h-10 min-h-0 w-full rounded-md border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-transparent focus-visible:ring-2 focus-visible:ring-ecke-focus'
              : 'min-h-touch w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-3 text-white focus:border-transparent focus-visible:ring-2 focus-visible:ring-ecke-focus'
          }
        />
        {isSearching ? (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-violet-400" />
          </div>
        ) : null}
      </div>

      <div id="search-smart-suggestions" hidden={!suggestionsOpen}>
        {suggestionsOpen ? (
          <SmartSearchSuggestions
            searchQuery={query}
            stateFilter={stateFilter}
            entityType={entityType}
          />
        ) : null}
      </div>
    </div>
  )
}
