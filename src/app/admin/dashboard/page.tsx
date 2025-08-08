'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        setDebug('Starting auth check...')
        
        if (!supabase) {
          setError('Supabase not configured')
          setDebug('Supabase not configured')
          return
        }

        setDebug('Checking current user...')
        // Check current user
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          setError('Not authenticated')
          setDebug('No current user found')
          return
        }

        setDebug(`User found: ${currentUser.email}, checking admin status...`)
        // Check if admin
        const adminStatus = await isAdmin()
        
        if (!adminStatus) {
          setError('Admin access required')
          setDebug(`User is not admin. Role: ${currentUser.role}`)
          return
        }

        setDebug('Admin access confirmed!')
        setUser(currentUser)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMsg)
        setDebug(`Error: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Loading admin dashboard...</div>
          {debug && (
            <div className="text-blue-400 text-sm">{debug}</div>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          {debug && (
            <div className="text-blue-400 text-sm mb-4">{debug}</div>
          )}
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name || user?.email}</p>
          {debug && (
            <div className="text-blue-400 text-sm mt-2">{debug}</div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/admin/add-event'}
                className="btn-primary w-full"
              >
                Add Event
              </button>
              <button 
                onClick={() => window.location.href = '/admin/add-dungeon'}
                className="btn-secondary w-full"
              >
                Add Dungeon
              </button>
              <button 
                onClick={() => window.location.href = '/admin/add-content'}
                className="btn-outline w-full"
              >
                Add Content
              </button>
            </div>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">User Info</h2>
            <div className="text-gray-300">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> <span className="text-green-400">{user?.role}</span></p>
              <p><strong>ID:</strong> {user?.id}</p>
            </div>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
            <div className="text-green-400">
              <p>✅ Admin Access Confirmed</p>
              <p>✅ Authentication Working</p>
              <p>✅ Database Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
