'use client'

import Link from 'next/link'
import { getAllEvents, getEventsByLocation, getEventsByCategory } from '@/data/events'
import { getAllDungeons, getDungeonsByLocation } from '@/data/dungeons'
import EventLogo from './EventLogo'
import DungeonLogo from './DungeonLogo'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface RelatedContentProps {
  currentEvent?: any
  currentDungeon?: any
  maxItems?: number
}

export default function RelatedContent({ currentEvent, currentDungeon, maxItems = 3 }: RelatedContentProps) {
  const [relatedEvents, setRelatedEvents] = useState<any[]>([])
  const [relatedDungeons, setRelatedDungeons] = useState<any[]>([])
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadRelatedContent = useCallback(async () => {
    try {
      setLoading(true)
      let events: any[] = []
      let dungeons: any[] = []
      let articles: any[] = []

      // Load related content based on current page type
      if (currentEvent && currentEvent.location?.state && currentEvent.category) {
        // Find events in the same location
        const locationEvents = getEventsByLocation(currentEvent.location.state) || []
        const filteredLocationEvents = locationEvents
          .filter(event => event.slug !== currentEvent.slug)
          .slice(0, maxItems)
        
        // Find events in the same category
        const categoryEvents = getEventsByCategory(currentEvent.category) || []
        const filteredCategoryEvents = categoryEvents
          .filter(event => event.slug !== currentEvent.slug)
          .slice(0, maxItems)
        
        // Combine and remove duplicates
        const allRelated = [...filteredLocationEvents, ...filteredCategoryEvents]
        events = allRelated
          .filter((event, index, self) => 
            index === self.findIndex(e => e.slug === event.slug)
          )
          .slice(0, maxItems)

        // Find dungeons in the same location
        const locationDungeons = getDungeonsByLocation(currentEvent.location.state) || []
        dungeons = locationDungeons.slice(0, 2) // Show fewer dungeons for events
      }

      if (currentDungeon && currentDungeon.location?.state && currentDungeon.category) {
        // Find dungeons in the same location
        const locationDungeons = getDungeonsByLocation(currentDungeon.location.state) || []
        const filteredLocationDungeons = locationDungeons
          .filter(dungeon => dungeon.slug !== currentDungeon.slug)
          .slice(0, maxItems)
        
        // Find dungeons in the same category
        const categoryDungeons = getAllDungeons() || []
        const filteredCategoryDungeons = categoryDungeons
          .filter(dungeon => dungeon.category === currentDungeon.category && dungeon.slug !== currentDungeon.slug)
          .slice(0, maxItems)
        
        // Combine and remove duplicates
        const allRelated = [...filteredLocationDungeons, ...filteredCategoryDungeons]
        dungeons = allRelated
          .filter((dungeon, index, self) => 
            index === self.findIndex(d => d.slug === dungeon.slug)
          )
          .slice(0, maxItems)

        // Find events in the same location
        const locationEvents = getEventsByLocation(currentDungeon.location.state) || []
        events = locationEvents.slice(0, 2) // Show fewer events for dungeons
      }

      // Load related education articles
      if (supabase) {
        try {
          const searchTerms = []
          if (currentEvent) {
            searchTerms.push(currentEvent.category, currentEvent.location.state)
          }
          if (currentDungeon) {
            searchTerms.push(currentDungeon.category, currentDungeon.location.state)
          }

          // Get articles that might be related to the content
          const { data: articlesData, error } = await supabase
            .from('articles')
            .select('id, title, slug, category, publish_date')
            .eq('status', 'published')
            .order('featured', { ascending: false })
            .order('publish_date', { ascending: false })
            .limit(maxItems)

          if (!error && articlesData) {
            articles = articlesData
          }
        } catch (error) {
          console.error('Error fetching related articles:', error)
        }
      }

      setRelatedEvents(events)
      setRelatedDungeons(dungeons)
      setRelatedArticles(articles)
    } catch (error) {
      console.error('Error loading related content:', error)
    } finally {
      setLoading(false)
    }
  }, [currentEvent, currentDungeon, maxItems])

  useEffect(() => {
    loadRelatedContent()
  }, [loadRelatedContent])

  if (loading) {
    return (
      <div className="mt-12 p-6 bg-dark-900/50 border border-dark-700 rounded-2xl animate-pulse motion-reduce:animate-none">
        <div className="h-6 bg-dark-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-dark-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (relatedEvents.length === 0 && relatedDungeons.length === 0 && relatedArticles.length === 0) {
    return null
  }

  return (
    <div className="mt-12 p-4 sm:p-6 bg-dark-900/50 border border-dark-700 rounded-2xl">
      <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-6">
        Related Content
      </h2>
      
      {relatedEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-primary-300 mb-4">
            Similar Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedEvents.map((event) => (
              <Link 
                key={event.slug} 
                href={`/events/${event.slug}`}
                prefetch={true}
                aria-label={`View ${event.name || 'Event'} details`}
                className="flex min-h-touch items-center p-4 bg-dark-800 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-colors duration-300 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100"
              >
                <div className="flex items-center gap-3 min-w-0 w-full">
                  {event.logo && (
                    <EventLogo 
                      src={event.logo}
                      alt={`${event.name || 'Event'} logo`}
                      size="small"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">
                      {event.name || 'Event'}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {event.location?.city || ''}, {event.location?.state || ''}
                    </p>
                    <p className="text-primary-400 text-xs">
                      {event.date?.display || ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedDungeons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-primary-300 mb-4">
            Nearby Dungeons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedDungeons.map((dungeon) => (
              <Link 
                key={dungeon.slug} 
                href={`/dungeons/${dungeon.slug}`}
                prefetch={true}
                aria-label={`View ${dungeon.name || 'Dungeon'} details`}
                className="flex min-h-touch items-center p-4 bg-dark-800 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-colors duration-300 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100"
              >
                <div className="flex items-center gap-3 min-w-0 w-full">
                  {dungeon.logo && (
                    <DungeonLogo 
                      src={dungeon.logo}
                      alt={`${dungeon.name || 'Dungeon'} logo`}
                      size="small"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">
                      {dungeon.name || 'Dungeon'}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {dungeon.location?.city || ''}, {dungeon.location?.state || ''}
                    </p>
                    <p className="text-primary-400 text-xs">
                      {dungeon.category || ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Education Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-primary-300 mb-4 flex items-center gap-2">
            <span className="text-base" aria-hidden>📚</span>
            Educational Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedArticles.map((article) => (
              <Link 
                key={article.id} 
                href={`/education/${article.slug}`}
                prefetch={true}
                aria-label={`Read ${article.title} article`}
                className="flex min-h-touch flex-col justify-center p-4 bg-dark-800 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-colors duration-300 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm line-clamp-2 mb-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded border border-primary-500/30">
                      {article.category}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(article.publish_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/education" className="inline-flex min-h-touch items-center justify-center text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors px-2">
              View all educational resources →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
