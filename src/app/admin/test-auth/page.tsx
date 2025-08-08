'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { supabase } from '@/lib/supabaseClient'

export default function TestAuthPage() {
  const { user, session, loading, isAdmin } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)

  useEffect(() => {
    const runTests = async () => {
      console.log('🧪 TEST AUTH: Starting authentication tests...')
      
      // Test 1: Get session
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        setSessionInfo({ session, error })
        console.log('🧪 TEST AUTH: Session test:', { session: !!session, error })
      } catch (error) {
        console.error('🧪 TEST AUTH: Session test error:', error)
        setSessionInfo({ session: null, error })
      }

      // Test 2: Get user
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        setAuthInfo({ user, error })
        console.log('🧪 TEST AUTH: User test:', { user: user?.email, error })
      } catch (error) {
        console.error('🧪 TEST AUTH: User test error:', error)
        setAuthInfo({ user: null, error })
      }
    }

    runTests()
  }, [])

  // Separate useEffect for profile test to avoid dependency issues
  useEffect(() => {
    const runProfileTest = async () => {
      if (!authInfo?.user || !supabase) {
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authInfo.user.id)
          .single()
        setProfileInfo({ profile, error })
        console.log('🧪 TEST AUTH: Profile test:', { profile, error })
      } catch (error) {
        console.error('🧪 TEST AUTH: Profile test error:', error)
        setProfileInfo({ profile: null, error })
      }
    }

    runProfileTest()
  }, [authInfo?.user])

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Test Page</h1>
        
        <div className="grid gap-6">
          {/* Context State */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Auth Context State</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user?.email || 'None'}</p>
              <p><strong>Role:</strong> {isAdmin ? 'admin' : 'user'}</p>
              <p><strong>Is Admin (Context):</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
            </div>
          </div>

          {/* Session Test */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Session Test</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Session:</strong> {sessionInfo?.session ? 'Found' : 'None'}</p>
              <p><strong>Session User:</strong> {sessionInfo?.session?.user?.email || 'None'}</p>
              <p><strong>Error:</strong> {sessionInfo?.error?.message || 'None'}</p>
            </div>
          </div>

          {/* User Test */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">User Test</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>User:</strong> {authInfo?.user?.email || 'None'}</p>
              <p><strong>User ID:</strong> {authInfo?.user?.id || 'None'}</p>
              <p><strong>Error:</strong> {authInfo?.error?.message || 'None'}</p>
            </div>
          </div>

          {/* Profile Test */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Test</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Profile:</strong> {profileInfo?.profile ? 'Found' : 'None'}</p>
              <p><strong>Role:</strong> {profileInfo?.profile?.role || 'None'}</p>
              <p><strong>Name:</strong> {profileInfo?.profile?.name || 'None'}</p>
              <p><strong>Error:</strong> {profileInfo?.error?.message || 'None'}</p>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Environment Variables</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set'}</p>
              <p><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="btn-primary"
              >
                Go to Admin Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="btn-secondary ml-4"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-outline ml-4"
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
