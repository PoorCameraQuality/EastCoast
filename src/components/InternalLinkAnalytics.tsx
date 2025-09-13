'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { supabase } from '@/lib/supabase'
import useBehaviorTracking from '@/hooks/useBehaviorTracking'

interface LinkAnalytics {
  totalClicks: number
  topClickedLinks: Array<{
    from: string
    to: string
    type: string
    clicks: number
  }>
  clickThroughRates: Record<string, number>
  popularCategories: Record<string, number>
  userEngagement: {
    averageTimeOnPage: number
    bounceRate: number
    returnVisitors: number
  }
}

interface InternalLinkAnalyticsProps {
  isAdmin?: boolean
}

export default function InternalLinkAnalytics({ isAdmin = false }: InternalLinkAnalyticsProps) {
  const [analytics, setAnalytics] = useState<LinkAnalytics>({
    totalClicks: 0,
    topClickedLinks: [],
    clickThroughRates: {},
    popularCategories: {},
    userEngagement: {
      averageTimeOnPage: 0,
      bounceRate: 0,
      returnVisitors: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const { behavior } = useBehaviorTracking()

  const calculateAnalytics = useCallback(() => {
    try {
      setLoading(true)

      // Calculate click analytics
      const clickedLinks = behavior.clickedLinks || []
      const totalClicks = clickedLinks.length

      // Group clicks by link
      const linkGroups: Record<string, number> = {}
      const categoryClicks: Record<string, number> = {}

      clickedLinks.forEach(click => {
        const linkKey = `${click.from} → ${click.to}`
        linkGroups[linkKey] = (linkGroups[linkKey] || 0) + 1
        categoryClicks[click.type] = (categoryClicks[click.type] || 0) + 1
      })

      // Get top clicked links
      const topClickedLinks = Object.entries(linkGroups)
        .map(([linkKey, clicks]) => {
          const [from, to] = linkKey.split(' → ')
          const link = clickedLinks.find(click => 
            click.from === from && click.to === to
          )
          return {
            from,
            to,
            type: link?.type || 'unknown',
            clicks
          }
        })
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10)

      // Calculate engagement metrics
      const pageViews = behavior.pageViews || {}
      const timeSpent = behavior.timeSpent || {}
      const totalPageViews = Object.values(pageViews).reduce((sum, views) => sum + views, 0)
      const totalTimeSpent = Object.values(timeSpent).reduce((sum, time) => sum + time, 0)

      const averageTimeOnPage = totalPageViews > 0 ? Math.round(totalTimeSpent / totalPageViews) : 0
      
      // Calculate bounce rate (single page visits)
      const singlePageVisits = Object.values(pageViews).filter(views => views === 1).length
      const bounceRate = totalPageViews > 0 ? Math.round((singlePageVisits / totalPageViews) * 100) : 0

      // Calculate return visitors (multiple page views)
      const returnVisitors = Object.values(pageViews).filter(views => views > 1).length

      setAnalytics({
        totalClicks,
        topClickedLinks,
        clickThroughRates: categoryClicks,
        popularCategories: categoryClicks,
        userEngagement: {
          averageTimeOnPage,
          bounceRate,
          returnVisitors
        }
      })
    } catch (error) {
      console.error('Error calculating analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [behavior])

  useEffect(() => {
    calculateAnalytics()
  }, [calculateAnalytics])

  if (!isAdmin) {
    return null // Only show to admins
  }

  if (loading) {
    return (
      <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          <span className="text-gray-300 text-sm">Loading analytics...</span>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return '🎪'
      case 'dungeon': return '🏰'
      case 'article': return '📚'
      case 'navigation': return '🧭'
      default: return '🔗'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-primary-400'
      case 'dungeon': return 'text-purple-400'
      case 'article': return 'text-green-400'
      case 'navigation': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-dark-800/50 border border-dark-600 rounded-lg">
          <div className="text-2xl font-bold text-white">{analytics.totalClicks}</div>
          <div className="text-sm text-gray-400">Total Link Clicks</div>
        </div>
        <div className="p-4 bg-dark-800/50 border border-dark-600 rounded-lg">
          <div className="text-2xl font-bold text-white">{analytics.userEngagement.averageTimeOnPage}s</div>
          <div className="text-sm text-gray-400">Avg. Time on Page</div>
        </div>
        <div className="p-4 bg-dark-800/50 border border-dark-600 rounded-lg">
          <div className="text-2xl font-bold text-white">{analytics.userEngagement.bounceRate}%</div>
          <div className="text-sm text-gray-400">Bounce Rate</div>
        </div>
      </div>

      {/* Top Clicked Links */}
      {analytics.topClickedLinks.length > 0 && (
        <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Top Internal Links
          </h3>
          <div className="space-y-2">
            {analytics.topClickedLinks.map((link, index) => (
              <div key={`${link.from}-${link.to}`} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400 w-6">#{index + 1}</span>
                  <span className="text-lg">{getTypeIcon(link.type)}</span>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {link.from} → {link.to}
                    </div>
                    <div className={`text-xs ${getTypeColor(link.type)}`}>
                      {link.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{link.clicks}</div>
                  <div className="text-xs text-gray-400">clicks</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Performance */}
      {Object.keys(analytics.popularCategories).length > 0 && (
        <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Category Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.popularCategories).map(([category, clicks]) => (
              <div key={category} className="text-center p-4 bg-dark-700/50 rounded-lg">
                <div className="text-2xl mb-2">{getTypeIcon(category)}</div>
                <div className="text-white font-semibold">{clicks}</div>
                <div className={`text-xs ${getTypeColor(category)}`}>
                  {category} clicks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Engagement Insights */}
      <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">👥</span>
          User Engagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-dark-700/50 rounded-lg">
            <div className="text-2xl font-bold text-white">{analytics.userEngagement.averageTimeOnPage}s</div>
            <div className="text-sm text-gray-400">Average Time on Page</div>
            <div className="text-xs text-primary-400 mt-1">
              {analytics.userEngagement.averageTimeOnPage > 30 ? 'High engagement' : 'Room for improvement'}
            </div>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-lg">
            <div className="text-2xl font-bold text-white">{analytics.userEngagement.bounceRate}%</div>
            <div className="text-sm text-gray-400">Bounce Rate</div>
            <div className="text-xs text-primary-400 mt-1">
              {analytics.userEngagement.bounceRate < 50 ? 'Good retention' : 'High bounce rate'}
            </div>
          </div>
          <div className="text-center p-4 bg-dark-700/50 rounded-lg">
            <div className="text-2xl font-bold text-white">{analytics.userEngagement.returnVisitors}</div>
            <div className="text-sm text-gray-400">Return Visitors</div>
            <div className="text-xs text-primary-400 mt-1">
              {analytics.userEngagement.returnVisitors > 0 ? 'Engaged users' : 'New visitors only'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6 bg-dark-800/50 border border-dark-600 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Optimization Recommendations
        </h3>
        <div className="space-y-3">
          {analytics.userEngagement.bounceRate > 60 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-yellow-400 text-sm font-medium">High Bounce Rate</div>
              <div className="text-gray-300 text-xs mt-1">
                Consider improving internal linking to keep users engaged longer.
              </div>
            </div>
          )}
          {analytics.userEngagement.averageTimeOnPage < 30 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-blue-400 text-sm font-medium">Low Engagement Time</div>
              <div className="text-gray-300 text-xs mt-1">
                Add more compelling related content suggestions to increase time on site.
              </div>
            </div>
          )}
          {analytics.totalClicks === 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-green-400 text-sm font-medium">Start Tracking</div>
              <div className="text-gray-300 text-xs mt-1">
                Internal link tracking is working. User behavior will be analyzed as they browse.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
