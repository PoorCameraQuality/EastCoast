'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface UserBehavior {
  pageViews: Record<string, number>
  timeSpent: Record<string, number>
  searchQueries: string[]
  clickedLinks: Array<{
    from: string
    to: string
    timestamp: number
    type: 'event' | 'dungeon' | 'article' | 'navigation'
  }>
  interests: Record<string, number>
}

interface BehaviorTrackingOptions {
  enableAnalytics?: boolean
  sessionTimeout?: number // in minutes
}

export default function useBehaviorTracking(options: BehaviorTrackingOptions = {}) {
  const { enableAnalytics = true, sessionTimeout = 30 } = options
  const pathname = usePathname()
  const [behavior, setBehavior] = useState<UserBehavior>({
    pageViews: {},
    timeSpent: {},
    searchQueries: [],
    clickedLinks: [],
    interests: {}
  })
  const [sessionStart, setSessionStart] = useState<number>(Date.now())
  const [currentPageStart, setCurrentPageStart] = useState<number>(Date.now())

  // Load behavior from localStorage on mount
  useEffect(() => {
    if (!enableAnalytics) return

    try {
      const savedBehavior = localStorage.getItem('userBehavior')
      if (savedBehavior) {
        const parsed = JSON.parse(savedBehavior)
        // Reset session if too old
        const lastSession = parsed.lastSession || 0
        const now = Date.now()
        if (now - lastSession > sessionTimeout * 60 * 1000) {
          setBehavior({
            pageViews: {},
            timeSpent: {},
            searchQueries: [],
            clickedLinks: [],
            interests: {}
          })
        } else {
          setBehavior(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading user behavior:', error)
    }
  }, [enableAnalytics, sessionTimeout])

  // Track page view
  const trackPageView = useCallback((page: string) => {
    if (!enableAnalytics) return

    setBehavior(prev => ({
      ...prev,
      pageViews: {
        ...prev.pageViews,
        [page]: (prev.pageViews[page] || 0) + 1
      }
    }))
  }, [enableAnalytics])

  // Track time spent on page
  const trackTimeSpent = useCallback((page: string, timeSpent: number) => {
    if (!enableAnalytics) return

    setBehavior(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [page]: (prev.timeSpent[page] || 0) + timeSpent
      }
    }))
  }, [enableAnalytics])

  // Track search query
  const trackSearch = useCallback((query: string) => {
    if (!enableAnalytics || !query.trim()) return

    setBehavior(prev => ({
      ...prev,
      searchQueries: [...prev.searchQueries.slice(-9), query.trim()] // Keep last 10 queries
    }))
  }, [enableAnalytics])

  // Track link click
  const trackLinkClick = useCallback((from: string, to: string, type: 'event' | 'dungeon' | 'article' | 'navigation') => {
    if (!enableAnalytics) return

    setBehavior(prev => ({
      ...prev,
      clickedLinks: [
        ...prev.clickedLinks.slice(-19), // Keep last 20 clicks
        {
          from,
          to,
          timestamp: Date.now(),
          type
        }
      ]
    }))

    // Update interests based on link type
    setBehavior(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [type]: (prev.interests[type] || 0) + 1
      }
    }))
  }, [enableAnalytics])

  // Track page view on route change
  useEffect(() => {
    if (!enableAnalytics) return

    // Track time spent on previous page
    if (currentPageStart > 0) {
      const timeSpent = Date.now() - currentPageStart
      const previousPage = pathname
      if (timeSpent > 1000) { // Only track if spent more than 1 second
        trackTimeSpent(previousPage, Math.floor(timeSpent / 1000))
      }
    }

    // Track new page view
    trackPageView(pathname)
    setCurrentPageStart(Date.now())
  }, [pathname, enableAnalytics, trackPageView, trackTimeSpent, currentPageStart])

  // Save behavior to localStorage
  useEffect(() => {
    if (!enableAnalytics) return

    const saveBehavior = () => {
      try {
        localStorage.setItem('userBehavior', JSON.stringify({
          ...behavior,
          lastSession: Date.now()
        }))
      } catch (error) {
        console.error('Error saving user behavior:', error)
      }
    }

    const timeoutId = setTimeout(saveBehavior, 1000) // Debounce saves
    return () => clearTimeout(timeoutId)
  }, [behavior, enableAnalytics])

  // Save on page unload
  useEffect(() => {
    if (!enableAnalytics) return

    const handleBeforeUnload = () => {
      // Track final time spent
      if (currentPageStart > 0) {
        const timeSpent = Date.now() - currentPageStart
        if (timeSpent > 1000) {
          trackTimeSpent(pathname, Math.floor(timeSpent / 1000))
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pathname, currentPageStart, trackTimeSpent, enableAnalytics])

  // Get personalized recommendations
  const getPersonalizedRecommendations = useCallback(() => {
    if (!enableAnalytics) return []

    const recommendations = []
    
    // Based on interests
    const sortedInterests = Object.entries(behavior.interests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    sortedInterests.forEach(([type, score]) => {
      recommendations.push({
        type,
        score,
        reason: `Based on your interest in ${type}s`
      })
    })

    // Based on recent searches
    if (behavior.searchQueries.length > 0) {
      recommendations.push({
        type: 'search',
        score: behavior.searchQueries.length,
        reason: 'Based on your recent searches'
      })
    }

    // Based on time spent
    const topPages = Object.entries(behavior.timeSpent)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)

    topPages.forEach(([page, time]) => {
      const pageType = page.includes('/events/') ? 'event' : 
                      page.includes('/dungeons/') ? 'dungeon' :
                      page.includes('/education/') ? 'article' : 'navigation'
      
      recommendations.push({
        type: pageType,
        score: time,
        reason: `Based on time spent on ${page}`
      })
    })

    return recommendations.slice(0, 5)
  }, [behavior, enableAnalytics])

  return {
    behavior,
    trackPageView,
    trackTimeSpent,
    trackSearch,
    trackLinkClick,
    getPersonalizedRecommendations
  }
}
