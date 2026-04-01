'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getAllSwingClubs } from '@/data/swingClubs'
import { supabase } from '@/lib/supabase'
import { useGA4 } from '@/contexts/GA4Provider'

interface SearchSuggestion {
  id: string
  title: string
  type: 'event' | 'dungeon' | 'swingClub' | 'article'
  slug: string
  category?: string
  location?: string
  relevanceScore: number
}

interface SmartSearchSuggestionsProps {
  searchQuery: string
  maxSuggestions?: number
}

export default function SmartSearchSuggestions({ searchQuery, maxSuggestions = 5 }: SmartSearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const { trackSearch, trackInternalLinkClick } = useGA4()

  const calculateRelevanceScore = useCallback((item: any, query: string, type: string): number => {
    const queryLower = query.toLowerCase()
    let score = 0

    // Exact title match gets highest score
    if (item.name?.toLowerCase().includes(queryLower) || item.title?.toLowerCase().includes(queryLower)) {
      score += 100
    }

    // Category match
    if (item.category?.toLowerCase().includes(queryLower)) {
      score += 50
    }

    // Location match
    if (item.location?.city?.toLowerCase().includes(queryLower) || 
        item.location?.state?.toLowerCase().includes(queryLower)) {
      score += 30
    }

    // Tags/content match for articles
    if (type === 'article' && item.tags) {
      const tags = Array.isArray(item.tags) ? item.tags : item.tags.split(',')
      tags.forEach((tag: string) => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 20
        }
      })
    }

    // Features match for events/dungeons
    if (item.features) {
      item.features.forEach((feature: string) => {
        if (feature.toLowerCase().includes(queryLower)) {
          score += 15
        }
      })
    }

    return score
  }, [])

  const loadSuggestions = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const allSuggestions: SearchSuggestion[] = []

      // Search events
      const allEvents = getAllEvents()
      allEvents.forEach(event => {
        const score = calculateRelevanceScore(event, searchQuery, 'event')
        if (score > 0) {
          allSuggestions.push({
            id: event.slug,
            title: event.name,
            type: 'event',
            slug: event.slug,
            category: event.category,
            location: `${event.location.city}, ${event.location.state}`,
            relevanceScore: score
          })
        }
      })

      // Search dungeons
      const allDungeons = getAllDungeons()
      allDungeons.forEach(dungeon => {
        const score = calculateRelevanceScore(dungeon, searchQuery, 'dungeon')
        if (score > 0) {
          allSuggestions.push({
            id: dungeon.slug,
            title: dungeon.name,
            type: 'dungeon',
            slug: dungeon.slug,
            category: dungeon.category,
            location: `${dungeon.location.city}, ${dungeon.location.state}`,
            relevanceScore: score
          })
        }
      })

      const allSwingClubs = getAllSwingClubs()
      allSwingClubs.forEach((club) => {
        const score = calculateRelevanceScore(club, searchQuery, 'swingClub')
        if (score > 0) {
          allSuggestions.push({
            id: club.slug,
            title: club.name,
            type: 'swingClub',
            slug: club.slug,
            category: club.category,
            location: `${club.location.city}, ${club.location.state}`,
            relevanceScore: score,
          })
        }
      })

      // Search articles
      if (supabase) {
        try {
          const { data: articles, error } = await supabase
            .from('articles')
            .select('id, title, slug, category, tags')
            .eq('status', 'published')
            .ilike('title', `%${searchQuery}%`)

          if (!error && articles) {
            articles.forEach(article => {
              const score = calculateRelevanceScore(article, searchQuery, 'article')
              if (score > 0) {
                allSuggestions.push({
                  id: article.id,
                  title: article.title,
                  type: 'article',
                  slug: article.slug,
                  category: article.category,
                  relevanceScore: score
                })
              }
            })
          }
        } catch (error) {
          console.error('Error searching articles:', error)
        }
      }

      // Sort by relevance score and limit results
      const sortedSuggestions = allSuggestions
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxSuggestions)

      setSuggestions(sortedSuggestions)
    } catch (error) {
      console.error('Error loading search suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, maxSuggestions, calculateRelevanceScore])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSuggestions()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [loadSuggestions])

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-[55]">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            <span className="text-gray-300 text-sm">Searching...</span>
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0 || !searchQuery.trim()) {
    return null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return '🎪'
      case 'dungeon': return '🏰'
      case 'swingClub': return '💃'
      case 'article': return '📚'
      default: return '🔍'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-primary-400'
      case 'dungeon': return 'text-purple-400'
      case 'swingClub': return 'text-social'
      case 'article': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getHref = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'event': return `/events/${suggestion.slug}`
      case 'dungeon': return `/dungeons/${suggestion.slug}`
      case 'swingClub': return `/swing-clubs/${suggestion.slug}`
      case 'article': return `/education/${suggestion.slug}`
      default: return '/'
    }
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-[55] max-h-80 overflow-y-auto">
      <div className="p-2">
        <div className="text-xs text-gray-400 px-3 py-2 border-b border-dark-600">
          Smart Suggestions
        </div>
        {suggestions.map((suggestion) => (
          <Link
            key={`${suggestion.type}-${suggestion.id}`}
            href={getHref(suggestion)}
            className="block p-3 hover:bg-dark-700 rounded-lg transition-colors group"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              // Safe tracking - use setTimeout to avoid blocking navigation
              setTimeout(() => {
                try {
                  trackSearch({
                    search_term: searchQuery,
                    results_count: suggestions.length,
                    search_type: 'smart_suggestions',
                    clicked_result: true,
                    result_position: suggestions.indexOf(suggestion) + 1
                  })
                  trackInternalLinkClick({
                    from_page: window.location.pathname,
                    to_page: getHref(suggestion),
                    link_text: suggestion.title,
                    link_type: suggestion.type,
                    link_position: 'search_suggestions',
                    content_category: suggestion.category,
                    content_location: suggestion.location
                  })
                } catch (error) {
                  // Silently fail if tracking has issues - don't block navigation
                  console.warn('Analytics tracking failed:', error)
                }
              }, 0)
            }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-medium text-sm group-hover:text-primary-300 transition-colors truncate">
                    {suggestion.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(suggestion.type)}`}>
                    {suggestion.type === 'swingClub'
                      ? 'Swing club'
                      : suggestion.type === 'dungeon'
                        ? 'Dungeon'
                        : suggestion.type === 'article'
                          ? 'Article'
                          : 'Event'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {suggestion.category && (
                    <span className="text-xs text-gray-400">{suggestion.category}</span>
                  )}
                  {suggestion.location && (
                    <span className="text-xs text-gray-400">• {suggestion.location}</span>
                  )}
                  <span className="text-xs text-primary-400">
                    {suggestion.relevanceScore}% match
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {/* Show more results link */}
        <div className="border-t border-dark-600 mt-2">
          <Link
            href={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="block p-3 text-center text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            View all results for "{searchQuery}" →
          </Link>
        </div>
      </div>
    </div>
  )
}
