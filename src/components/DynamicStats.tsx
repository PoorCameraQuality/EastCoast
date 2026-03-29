'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { supabase } from '@/lib/supabase'

interface StatsData {
  totalEvents: number
  totalDungeons: number
  totalArticles: number
  upcomingEvents: number
  recentArticles: any[]
  featuredEvents: any[]
}

export default function DynamicStats() {
  const [stats, setStats] = useState<StatsData>({
    totalEvents: 0,
    totalDungeons: 0,
    totalArticles: 0,
    upcomingEvents: 0,
    recentArticles: [],
    featuredEvents: []
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Get events and dungeons from static data
      const allEvents = getAllEvents()
      const allDungeons = getAllDungeons()
      
      // Calculate upcoming events
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date.start)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })

      // Get recent articles from database
      let recentArticles: any[] = []
      let totalArticles = 0
      
      if (supabase) {
        try {
          // First get the total count of published articles
          const { count: totalCount, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')

          if (!countError && totalCount !== null) {
            totalArticles = totalCount
          }

          // Then get recent articles for preview
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

      // Get featured events (first 3 upcoming events)
      const featuredEvents = upcomingEvents.slice(0, 3)

      setStats({
        totalEvents: allEvents.length,
        totalDungeons: allDungeons.length,
        totalArticles,
        upcomingEvents: upcomingEvents.length,
        recentArticles,
        featuredEvents
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-dark-800/50 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-dark-700 rounded mb-2"></div>
            <div className="h-8 bg-dark-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/events" className="group">
          <div className="bg-gradient-to-br from-primary-600/20 to-primary-600/20 border border-primary-500/30 rounded-xl p-6 hover:border-primary-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎪</span>
              </div>
              <Link href="/events" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                View All →
              </Link>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalEvents}</div>
            <div className="text-gray-300 text-sm">Total Events</div>
            <div className="text-primary-300 text-xs mt-1">{stats.upcomingEvents} upcoming</div>
          </div>
        </Link>

        <Link href="/dungeons" className="group">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏰</span>
              </div>
              <Link href="/dungeons" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                View All →
              </Link>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalDungeons}</div>
            <div className="text-gray-300 text-sm">Dungeons</div>
            <div className="text-purple-300 text-xs mt-1">East Coast locations</div>
          </div>
        </Link>

        <Link href="/education" className="group">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <Link href="/education" className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                View All →
              </Link>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.totalArticles}</div>
            <div className="text-gray-300 text-sm">Articles</div>
            <div className="text-green-300 text-xs mt-1">Educational content</div>
          </div>
        </Link>

        <Link href="/calendar" className="group">
          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <Link href="/calendar" className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
                View All →
              </Link>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.upcomingEvents}</div>
            <div className="text-gray-300 text-sm">Upcoming</div>
            <div className="text-orange-300 text-xs mt-1">Events scheduled</div>
          </div>
        </Link>
      </div>

      {/* Content Previews */}
      {!loading && (stats.recentArticles.length > 0 || stats.featuredEvents.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Articles */}
          {stats.recentArticles.length > 0 && (
            <div className="bg-dark-800/30 border border-dark-600/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-white">Latest Articles</h3>
                <Link href="/education" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentArticles.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/education/${article.slug}`}
                    className="block p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
                  >
                    <h4 className="text-white font-medium text-sm group-hover:text-primary-300 transition-colors line-clamp-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
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
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured Events */}
          {stats.featuredEvents.length > 0 && (
            <div className="bg-dark-800/30 border border-dark-600/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-white">Upcoming Events</h3>
                <Link href="/events" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {stats.featuredEvents.map((event) => (
                  <Link 
                    key={event.slug} 
                    href={`/events/${event.slug}`}
                    className="block p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
                  >
                    <h4 className="text-white font-medium text-sm group-hover:text-primary-300 transition-colors line-clamp-1">
                      {event.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary-300 text-xs">
                        {event.date.display}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {event.location.city}, {event.location.state}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}