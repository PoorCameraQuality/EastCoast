'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ModerationLog {
  id: string
  action: string
  article_title: string
  article_id: string
  admin_name: string
  timestamp: string
  notes: string
  created_at: string
}

export default function ModerationLogsClient() {
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('timestamp')

  useEffect(() => {
    fetchModerationLogs()
  }, [filter, sortBy])

  const fetchModerationLogs = async () => {
    try {
      let query = supabase
        .from('moderation_logs')
        .select('*')
        .order(sortBy === 'timestamp' ? 'timestamp' : 'created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('action', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching moderation logs:', error)
        return
      }

      setLogs(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'edited':
        return 'bg-blue-500'
      case 'deleted':
        return 'bg-red-600'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-dark-800 p-6 rounded-lg border border-dark-600">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Action</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
            >
              <option value="all">All Actions</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="edited">Edited</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
            >
              <option value="timestamp">Timestamp</option>
              <option value="created_at">Created Date</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <span className="text-gray-400 text-sm">
              Total Logs: {logs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-medium">
                      {log.article_title}
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: {log.article_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.admin_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="max-w-xs truncate" title={log.notes}>
                      {log.notes || 'No notes'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No moderation logs found</div>
            <div className="text-gray-500 text-sm mt-2">
              {filter !== 'all' ? `No logs for action: ${filter}` : 'No logs have been created yet'}
            </div>
          </div>
        )}
      </div>

      {/* Back to Dashboard */}
      <div className="text-center">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
