'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  pendingSubmissions: number
  publishedArticles: number
  totalModerationLogs: number
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingSubmissions: 0,
    publishedArticles: 0,
    totalModerationLogs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.error('Supabase is not configured')
        setLoading(false)
        return
      }

      // Get pending submissions count
      const { count: pendingCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get published articles count
      const { count: articlesCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      // Get moderation logs count
      const { count: logsCount } = await supabase
        .from('moderation_logs')
        .select('*', { count: 'exact', head: true })

      setStats({
        pendingSubmissions: pendingCount || 0,
        publishedArticles: articlesCount || 0,
        totalModerationLogs: logsCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminTools = [
    {
      title: 'Review Submissions',
      description: 'Review and approve/reject article submissions',
      href: '/admin/review-submissions',
      icon: '📝',
      color: 'bg-blue-600',
      stat: stats.pendingSubmissions
    },
    {
      title: 'Manage Articles',
      description: 'Edit and delete published articles',
      href: '/admin/manage-articles',
      icon: '📰',
      color: 'bg-green-600',
      stat: stats.publishedArticles
    },
    {
      title: 'Moderation Logs',
      description: 'View all admin actions and changes',
      href: '/admin/moderation-logs',
      icon: '📋',
      color: 'bg-purple-600',
      stat: stats.totalModerationLogs
    },
    {
      title: 'Add New Event',
      description: 'Add new events to the calendar',
      href: '/admin/add-event',
      icon: '📅',
      color: 'bg-orange-600'
    },
    {
      title: 'Add New Dungeon',
      description: 'Add new dungeons to the directory',
      href: '/admin/add-dungeon',
      icon: '🏰',
      color: 'bg-red-600'
    },
    {
      title: 'Add Content',
      description: 'Add educational content and articles',
      href: '/admin/add-content',
      icon: '📚',
      color: 'bg-indigo-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Submissions</p>
              <p className="text-2xl font-bold text-white">{stats.pendingSubmissions}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
        
        <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Published Articles</p>
              <p className="text-2xl font-bold text-white">{stats.publishedArticles}</p>
            </div>
            <div className="text-3xl">📰</div>
          </div>
        </div>
        
        <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Moderation Actions</p>
              <p className="text-2xl font-bold text-white">{stats.totalModerationLogs}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className="group bg-dark-800 p-6 rounded-lg border border-dark-600 hover:border-primary-500 transition-all duration-300 hover:scale-105 transform"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {tool.icon}
                </div>
                {tool.stat !== undefined && (
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    {tool.stat}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {tool.title}
              </h3>
              
              <p className="text-gray-400 text-sm">
                {tool.description}
              </p>
              
              <div className="mt-4 flex items-center text-primary-400 text-sm group-hover:text-primary-300 transition-colors">
                <span>Access Tool</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.open('/admin/review-submissions', '_blank')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Review Latest Submissions
          </button>
          <button
            onClick={() => window.open('/admin/manage-articles', '_blank')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Manage Articles
          </button>
          <button
            onClick={() => window.open('/education', '_blank')}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            View Education Section
          </button>
        </div>
      </div>
    </div>
  )
}
