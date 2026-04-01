'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import DungeonLogo from '@/components/DungeonLogo'
import SmartSearchSuggestions from '@/components/SmartSearchSuggestions'
import { useGA4 } from '@/contexts/GA4Provider'

interface SearchResult {
  type: 'event' | 'dungeon' | 'swingClub'
  slug: string
  name: string
  location: {
    city: string
    state: string
  }
  logo?: string
  date?: {
    display: string
  }
  category?: string
}

interface SearchProps {
  events: any[]
  dungeons: any[]
  swingClubs?: any[]
  placeholder?: string
  /** Tighter input and typography for directory hero strips */
  compact?: boolean
}

function hrefForSearchResult(r: SearchResult): string {
  if (r.type === 'event') return `/events/${r.slug}`
  if (r.type === 'dungeon') return `/dungeons/${r.slug}`
  return `/swing-clubs/${r.slug}`
}

function labelForSearchType(t: SearchResult['type']): string {
  if (t === 'event') return 'Event'
  if (t === 'dungeon') return 'Dungeon'
  return 'Swing club'
}

export default function Search({
  events,
  dungeons,
  swingClubs = [],
  placeholder = 'Search events, dungeons, and swing clubs...',
  compact = false,
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const { trackSearch, trackInternalLinkClick, trackUserInteraction } = useGA4()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    
    const searchResults: SearchResult[] = []
    const lowerQuery = debouncedQuery.toLowerCase()

    // Search events
    events.forEach(event => {
      if (
        event.name.toLowerCase().includes(lowerQuery) ||
        event.location.city.toLowerCase().includes(lowerQuery) ||
        event.location.state.toLowerCase().includes(lowerQuery) ||
        (event.category && event.category.toLowerCase().includes(lowerQuery))
      ) {
        searchResults.push({
          type: 'event',
          slug: event.slug,
          name: event.name,
          location: event.location,
          logo: event.logo,
          date: event.date,
          category: event.category
        })
      }
    })

    // Search dungeons
    dungeons.forEach(dungeon => {
      if (
        dungeon.name.toLowerCase().includes(lowerQuery) ||
        dungeon.location.city.toLowerCase().includes(lowerQuery) ||
        dungeon.location.state.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'dungeon',
          slug: dungeon.slug,
          name: dungeon.name,
          location: dungeon.location,
          logo: dungeon.logo
        })
      }
    })

    swingClubs.forEach((club) => {
      if (
        club.name.toLowerCase().includes(lowerQuery) ||
        club.location.city.toLowerCase().includes(lowerQuery) ||
        club.location.state.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'swingClub',
          slug: club.slug,
          name: club.name,
          location: club.location,
          logo: club.logo,
        })
      }
    })

    setResults(searchResults.slice(0, 6))
    setShowSuggestions(true)
    setIsSearching(false)

    // Track search event (non-intrusive, no event listeners)
    trackSearch({
      search_term: debouncedQuery,
      results_count: searchResults.length,
      search_type: 'site_search',
      clicked_result: false
    })
  }, [debouncedQuery, events, dungeons, swingClubs, trackSearch])

  // Generate search structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "East Coast Kink Events",
    "url": "https://eastcoastkinkevents.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://eastcoastkinkevents.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const suggestionsOpen = searchFocused && query.length >= 2
  const resultsOpen = results.length > 0
  const listboxOpen = suggestionsOpen || resultsOpen

  return (
    <>
      <script
        id="search-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="relative z-[55]">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setSearchFocused(false), 200)
            }}
            placeholder={placeholder}
            role="combobox"
            aria-label="Search events, dungeons, and swing clubs"
            aria-autocomplete="list"
            aria-expanded={listboxOpen}
            aria-controls="search-smart-suggestions search-results"
            className={
              compact
                ? 'w-full h-10 min-h-0 px-3 py-2 text-sm bg-dark-700 text-white border border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                : 'w-full min-h-touch px-4 py-3 bg-dark-700 text-white border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            }
          />
          {isSearching && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-400"></div>
            </div>
          )}
        </div>

        {/* Smart Search Suggestions — container always in DOM for combobox aria-controls */}
        <div id="search-smart-suggestions" hidden={!suggestionsOpen}>
          {suggestionsOpen ? <SmartSearchSuggestions searchQuery={query} /> : null}
        </div>

        <div
          id="search-results"
          hidden={!resultsOpen}
          className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl max-h-96 overflow-y-auto"
        >
            {results.map((result, index) => (
              <Link
                key={`${result.type}-${result.slug}`}
                href={hrefForSearchResult(result)}
                className="block p-4 hover:bg-dark-700 transition-colors border-b border-dark-600 last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  // Safe tracking - use setTimeout to avoid blocking navigation
                  setTimeout(() => {
                    try {
                      trackSearch({
                        search_term: query,
                        results_count: results.length,
                        search_type: 'site_search',
                        clicked_result: true,
                        result_position: index + 1
                      })
                      trackInternalLinkClick({
                        from_page: window.location.pathname,
                        to_page: hrefForSearchResult(result),
                        link_text: result.name,
                        link_type: result.type,
                        link_position: 'search_results',
                        content_category: result.category,
                        content_location: `${result.location.city}, ${result.location.state}`
                      })
                    } catch (error) {
                      // Silently fail if tracking has issues - don't block navigation
                      console.warn('Analytics tracking failed:', error)
                    }
                  }, 0)
                }}
              >
                <div className="flex items-center space-x-3">
                  {result.logo && (
                    <div className="flex-shrink-0">
                      {result.type === 'event' ? (
                        <EventLogo 
                          src={result.logo} 
                          alt={`${result.name} logo`}
                          size="small"
                        />
                      ) : (
                        <DungeonLogo 
                          src={result.logo} 
                          alt={`${result.name} logo`}
                          size="small"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium truncate">
                        {result.name}
                      </span>
                      <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                        {labelForSearchType(result.type)}
                      </span>
                    </div>
                    <p className="text-sm text-subtle">
                      <span className="sr-only">Location: </span>
                      {result.location.city}, {result.location.state}
                    </p>
                    {result.date && (
                      <p className="text-sm text-subtle">{result.date.display}</p>
                    )}
                    {result.category && (
                      <p className="text-xs text-primary-400">{result.category}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </>
  )
}
