'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { supabase } from '@/lib/supabase'

interface RecentContent {
  recentEvents: Array<{
    slug: string
    name: string
    date: { display: string }
    location: { city: string; state: string }
  }>
  recentArticles: Array<{
    id: string
    title: string
    slug: string
    category: string
    publish_date: string
  }>
  featuredDungeons: Array<{
    slug: string
    name: string
    location: { city: string; state: string }
    category: string
  }>
}

export default function FooterRecentContent() {
  const [content, setContent] = useState<RecentContent>({
    recentEvents: [],
    recentArticles: [],
    featuredDungeons: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentContent()
  }, [])

  const loadRecentContent = async () => {
    try {
      setLoading(true)
      
      // Get recent events (upcoming)
      const allEvents = getAllEvents()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date.start)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      }).slice(0, 3)

      // Get featured dungeons (first 3)
      const allDungeons = getAllDungeons()
      const featuredDungeons = allDungeons.slice(0, 3)

      // Get recent articles from database
      let recentArticles: any[] = []
      
      if (supabase) {
        try {
          const { data: articles, error } = await supabase
            .from('articles')
            .select('id, title, slug, category, publish_date')
            .eq('status', 'published')
            .order('publish_date', { ascending: false })
            .limit(3)

          if (!error && articles) {
            recentArticles = articles
          }
        } catch (error) {
          console.error('Error fetching articles:', error)
        }
      }

      setContent({
        recentEvents: upcomingEvents,
        recentArticles,
        featuredDungeons
      })
    } catch (error) {
      console.error('Error loading recent content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // Don't show loading state in footer
  }

  return (
    <div>
      <h3 className="text-lg font-serif font-semibold text-white mb-6 flex items-center">
        <span className="w-8 h-px bg-primary-500 mr-3"></span>
        Recent Updates
      </h3>
      
      <div className="space-y-8">
        {/* Recent Events */}
        {content.recentEvents.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-primary-300 mb-4 flex items-center">
              <span className="mr-2">🎪</span>
              Upcoming Events
            </h4>
            <ul className="space-y-3">
              {content.recentEvents.map((event) => (
                <li key={event.slug}>
                  <Link 
                    href={`/events/${event.slug}`}
                    className="block text-gray-300 hover:text-primary-300 transition-colors duration-300 group"
                  >
                    <div className="text-sm font-medium group-hover:text-white transition-colors">
                      {event.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {event.date.display} • {event.location.city}, {event.location.state}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/events" className="text-sm text-primary-400 hover:text-primary-300 transition-colors mt-3 inline-block">
              View all events →
            </Link>
          </div>
        )}

        {/* Recent Articles */}
        {content.recentArticles.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-primary-300 mb-4 flex items-center">
              <span className="mr-2">📚</span>
              Latest Articles
            </h4>
            <ul className="space-y-3">
              {content.recentArticles.map((article) => (
                <li key={article.id}>
                  <Link 
                    href={`/education/${article.slug}`}
                    className="block text-gray-300 hover:text-primary-300 transition-colors duration-300 group"
                  >
                    <div className="text-sm font-medium group-hover:text-white transition-colors">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {article.category} • {new Date(article.publish_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/education" className="text-sm text-primary-400 hover:text-primary-300 transition-colors mt-3 inline-block">
              View all articles →
            </Link>
          </div>
        )}

        {/* Featured Dungeons */}
        {content.featuredDungeons.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-primary-300 mb-4 flex items-center">
              <span className="mr-2">🏰</span>
              Featured Dungeons
            </h4>
            <ul className="space-y-3">
              {content.featuredDungeons.map((dungeon) => (
                <li key={dungeon.slug}>
                  <Link 
                    href={`/dungeons/${dungeon.slug}`}
                    className="block text-gray-300 hover:text-primary-300 transition-colors duration-300 group"
                  >
                    <div className="text-sm font-medium group-hover:text-white transition-colors">
                      {dungeon.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {dungeon.category} • {dungeon.location.city}, {dungeon.location.state}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/dungeons" className="text-sm text-primary-400 hover:text-primary-300 transition-colors mt-3 inline-block">
              View all dungeons →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
