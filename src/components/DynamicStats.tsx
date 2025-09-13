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
  recentArticles: Array<{
    id: string
    title: string
    slug: string
    category: string
    created_at: string
  }>
  featuredEvents: Array<{
    slug: string
    name: string
    date: { display: string }
    location: { city: string; state: string }
    category: string
  }>
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

  useEffect(() => {
    loadStats()
  }, [])

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
          const { data: articles, error } = await supabase
            .from('articles')
            .select('id, title, slug, category, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(3)

          if (!error && articles) {
            recentArticles = articles
            totalArticles = articles.length
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
          <div className="bg-gradient-to-br from-primary-600/20 to-blue-600/20 border border-primary-500/30 rounded-xl p-6 hover:border-primary-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎪</span>
              </div>
              <span className="text-primary-400 text-sm font-medium group-hover:text-primary-300 transition-colors">
                View All →
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalEvents}</h3>
            <p className="text-gray-400 text-sm">Total Events</p>
            <p className="text-primary-300 text-xs mt-1">{stats.upcomingEvents} upcoming</p>
          </div>
        </Link>

        <Link href="/dungeons" className="group">
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏰</span>
              </div>
              <span className="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
                View All →
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalDungeons}</h3>
            <p className="text-gray-400 text-sm">Dungeons</p>
            <p className="text-purple-300 text-xs mt-1">East Coast locations</p>
          </div>
        </Link>

        <Link href="/education" className="group">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-green-400 text-sm font-medium group-hover:text-green-300 transition-colors">
                View All →
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalArticles}</h3>
            <p className="text-gray-400 text-sm">Articles</p>
            <p className="text-green-300 text-xs mt-1">Educational content</p>
          </div>
        </Link>

        <Link href="/calendar" className="group">
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <span className="text-yellow-400 text-sm font-medium group-hover:text-yellow-300 transition-colors">
                View All →
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.upcomingEvents}</h3>
            <p className="text-gray-400 text-sm">Upcoming</p>
            <p className="text-yellow-300 text-xs mt-1">Events scheduled</p>
          </div>
        </Link>
      </div>

      {/* Recent Content Preview */}
      {(stats.recentArticles.length > 0 || stats.featuredEvents.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        {new Date(article.created_at).toLocaleDateString('en-US', {
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
