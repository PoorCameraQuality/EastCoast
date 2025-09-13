'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { supabase } from '@/lib/supabase'
import useBehaviorTracking from '@/hooks/useBehaviorTracking'

interface Recommendation {
  id: string
  title: string
  type: 'event' | 'dungeon' | 'article'
  slug: string
  category?: string
  location?: string
  reason: string
  confidence: number
}

interface PersonalizedRecommendationsProps {
  maxRecommendations?: number
}

export default function PersonalizedRecommendations({ maxRecommendations = 3 }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const { behavior, getPersonalizedRecommendations } = useBehaviorTracking()

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      const allRecommendations: Recommendation[] = []

      // Get user behavior insights
      const behaviorInsights = getPersonalizedRecommendations()
      
      if (behaviorInsights.length === 0) {
        // No behavior data, show trending content
        const trendingEvents = getAllEvents()
          .filter(event => {
            const eventDate = new Date(event.date.start)
            const now = new Date()
            const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            return daysDiff <= 30 && daysDiff >= 0 // Upcoming events within 30 days
          })
          .slice(0, maxRecommendations)

        trendingEvents.forEach(event => {
          allRecommendations.push({
            id: event.slug,
            title: event.name,
            type: 'event',
            slug: event.slug,
            category: event.category,
            location: `${event.location.city}, ${event.location.state}`,
            reason: 'Trending upcoming events',
            confidence: 75
          })
        })
      } else {
        // Generate recommendations based on behavior
        behaviorInsights.forEach(insight => {
          if (insight.type === 'event') {
            const events = getAllEvents()
              .filter(event => {
                const eventDate = new Date(event.date.start)
                const now = new Date()
                const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                return daysDiff >= 0 // Upcoming events
              })
              .slice(0, 2)

            events.forEach(event => {
              allRecommendations.push({
                id: event.slug,
                title: event.name,
                type: 'event',
                slug: event.slug,
                category: event.category,
                location: `${event.location.city}, ${event.location.state}`,
                reason: insight.reason,
                confidence: Math.min(95, 60 + insight.score * 5)
              })
            })
          }

          if (insight.type === 'dungeon') {
            const dungeons = getAllDungeons().slice(0, 2)

            dungeons.forEach(dungeon => {
              allRecommendations.push({
                id: dungeon.slug,
                title: dungeon.name,
                type: 'dungeon',
                slug: dungeon.slug,
                category: dungeon.category,
                location: `${dungeon.location.city}, ${dungeon.location.state}`,
                reason: insight.reason,
                confidence: Math.min(95, 60 + insight.score * 5)
              })
            })
          }

          if (insight.type === 'article') {
            // This would be handled by the articles section below
          }
        })

        // Add articles based on behavior
        if (supabase) {
          try {
            const { data: articles, error } = await supabase
              .from('articles')
              .select('id, title, slug, category, created_at')
              .eq('status', 'published')
              .order('featured', { ascending: false })
              .order('created_at', { ascending: false })
              .limit(maxRecommendations)

            if (!error && articles) {
              articles.forEach(article => {
                allRecommendations.push({
                  id: article.id,
                  title: article.title,
                  type: 'article',
                  slug: article.slug,
                  category: article.category,
                  reason: 'Educational content you might enjoy',
                  confidence: 70
                })
              })
            }
          } catch (error) {
            console.error('Error fetching recommended articles:', error)
          }
        }
      }

      // Remove duplicates and sort by confidence
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, self) => 
          index === self.findIndex(r => r.id === rec.id)
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxRecommendations)

      setRecommendations(uniqueRecommendations)
    } catch (error) {
      console.error('Error loading personalized recommendations:', error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }, [behavior, getPersonalizedRecommendations, maxRecommendations])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  if (loading) {
    return (
      <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          <span className="text-gray-300 text-sm">Loading personalized recommendations...</span>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl text-center">
        <div className="text-gray-400 text-sm">
          Browse more content to get personalized recommendations!
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return '🎪'
      case 'dungeon': return '🏰'
      case 'article': return '📚'
      default: return '🔍'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-primary-400'
      case 'dungeon': return 'text-purple-400'
      case 'article': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400'
    if (confidence >= 75) return 'text-yellow-400'
    if (confidence >= 60) return 'text-orange-400'
    return 'text-gray-400'
  }

  const getHref = (recommendation: Recommendation) => {
    switch (recommendation.type) {
      case 'event': return `/events/${recommendation.slug}`
      case 'dungeon': return `/dungeons/${recommendation.slug}`
      case 'article': return `/education/${recommendation.slug}`
      default: return '/'
    }
  }

  return (
    <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🎯</span>
          For You
        </h3>
        <div className="text-xs text-gray-400">
          {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <Link
            key={`${recommendation.type}-${recommendation.id}`}
            href={getHref(recommendation)}
            className="block p-4 bg-dark-700/50 hover:bg-dark-700 border border-dark-600 rounded-lg transition-all duration-300 hover:border-primary-500/50 group"
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl flex-shrink-0">{getTypeIcon(recommendation.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium text-sm group-hover:text-primary-300 transition-colors truncate">
                    {recommendation.title}
                  </h4>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(recommendation.type)}`}>
                      {recommendation.type}
                    </span>
                    <span className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}>
                      {recommendation.confidence}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  {recommendation.category && (
                    <span className="text-xs text-gray-400">{recommendation.category}</span>
                  )}
                  {recommendation.location && (
                    <span className="text-xs text-gray-400">• {recommendation.location}</span>
                  )}
                </div>
                <div className="text-xs text-primary-400 italic">
                  {recommendation.reason}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          href="/events" 
          className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
        >
          Explore more content →
        </Link>
      </div>
    </div>
  )
}
