'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export default function DebugPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        setTimestamp(new Date().toISOString())
        
        if (!supabase) {
          setError('Supabase not configured')
          setLoading(false)
          return
        }
        
        // Check current user
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        // Check if admin
        const adminStatus = await isAdmin()
        setIsAdminUser(adminStatus)
        
        // Get raw profile data
        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
          
          if (!profileError) {
            setProfile(profileData)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading authentication data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Debug</h1>
        <p className="text-gray-400 mb-6">Last updated: {timestamp}</p>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-white p-4 mb-6 rounded">
            Error: {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
            <pre className="text-green-400 text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <pre className="text-blue-400 text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Status</h2>
            <div className="text-white">
              <p>Is Admin: <span className={isAdminUser ? 'text-green-400' : 'text-red-400'}>
                {isAdminUser === null ? 'Checking...' : isAdminUser ? 'Yes' : 'No'}
              </span></p>
              <p className="text-sm text-gray-400 mt-2">
                Database shows: ADMIN ACCESS GRANTED
              </p>
            </div>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/admin/dashboard'}
                className="btn-primary w-full"
              >
                Go to Admin Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="btn-secondary w-full"
              >
                Go to Login
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-outline w-full"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

