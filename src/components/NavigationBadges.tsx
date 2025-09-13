'use client'

import { useState, useEffect } from 'react'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { supabase } from '@/lib/supabase'

interface NavigationBadges {
  events: {
    total: number
    upcoming: number
    new: number
  }
  dungeons: {
    total: number
    new: number
  }
  articles: {
    total: number
    new: number
  }
}

export default function NavigationBadges() {
  const [badges, setBadges] = useState<NavigationBadges>({
    events: { total: 0, upcoming: 0, new: 0 },
    dungeons: { total: 0, new: 0 },
    articles: { total: 0, new: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadgeData()
  }, [])

  const loadBadgeData = async () => {
    try {
      setLoading(true)
      
      // Get events data
      const allEvents = getAllEvents()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date.start)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })

      // Count new events (created in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const newEvents = allEvents.filter(event => {
        const createdDate = new Date(event.date.start)
        return createdDate >= thirtyDaysAgo
      })

      // Get dungeons data
      const allDungeons = getAllDungeons()
      const newDungeons = allDungeons.filter(dungeon => {
        // Since dungeons don't have created_at, we'll use a fixed date for now
        // In a real implementation, this would come from the database
        return true // Show all dungeons as "new" for demo purposes
      })

      // Get articles data
      let totalArticles = 0
      let newArticles = 0
      
      if (supabase) {
        try {
          // Get total count
          const { count: totalCount, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')

          if (!countError && totalCount !== null) {
            totalArticles = totalCount
          }

          // Get new articles count
          const { count: newCount, error: newCountError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
            .gte('created_at', thirtyDaysAgo.toISOString())

          if (!newCountError && newCount !== null) {
            newArticles = newCount
          }
        } catch (error) {
          console.error('Error fetching article counts:', error)
        }
      }

      setBadges({
        events: {
          total: allEvents.length,
          upcoming: upcomingEvents.length,
          new: newEvents.length
        },
        dungeons: {
          total: allDungeons.length,
          new: newDungeons.length
        },
        articles: {
          total: totalArticles,
          new: newArticles
        }
      })
    } catch (error) {
      console.error('Error loading badge data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // Don't show badges while loading
  }

  const getBadgeText = (section: string, data: any) => {
    switch (section) {
      case 'events':
        return `${data.total} Events${data.upcoming > 0 ? ` (${data.upcoming} upcoming)` : ''}`
      case 'dungeons':
        return `${data.total} Dungeons`
      case 'education':
        return `${data.total} Articles`
      default:
        return ''
    }
  }

  const getBadgeCounts = (section: string) => {
    switch (section) {
      case 'events':
        return badges.events
      case 'dungeons':
        return badges.dungeons
      case 'education':
        return badges.articles
      default:
        return { total: 0, new: 0 }
    }
  }

  const getBadgeColor = (section: string) => {
    switch (section) {
      case 'events':
        return 'bg-primary-500'
      case 'dungeons':
        return 'bg-purple-500'
      case 'education':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getNewBadgeColor = (section: string) => {
    switch (section) {
      case 'events':
        return 'bg-red-500'
      case 'dungeons':
        return 'bg-orange-500'
      case 'education':
        return 'bg-blue-500'
      default:
        return 'bg-yellow-500'
    }
  }

  return {
    getBadgeText,
    getBadgeCounts,
    getBadgeColor,
    getNewBadgeColor,
    badges,
    loading
  }
}
