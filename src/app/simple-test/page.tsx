'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleTest() {
  const [status, setStatus] = useState('Loading...')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const testAuth = async () => {
      try {
        console.log('🚀 SIMPLE: Starting test...')
        setStatus('Testing Supabase connection...')
        
        if (!supabase) {
          console.log('❌ SIMPLE: Supabase is null')
          setStatus('Supabase not configured')
          return
        }

        console.log('✅ SIMPLE: Supabase client exists')
        setStatus('Getting user...')
        
        // Direct Supabase call
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.log('❌ SIMPLE: Auth error:', error)
          setStatus(`Auth error: ${error.message}`)
          return
        }

        if (!user) {
          console.log('❌ SIMPLE: No user found')
          setStatus('No user found')
          return
        }

        console.log('✅ SIMPLE: User found:', user.email)
        setUser(user)
        setStatus('Getting profile...')

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('❌ SIMPLE: Profile error:', profileError)
          setStatus(`Profile error: ${profileError.message}`)
          return
        }

        console.log('✅ SIMPLE: Profile found:', profileData)
        setProfile(profileData)
        setStatus('Success!')
        
      } catch (err) {
        console.log('❌ SIMPLE: Unexpected error:', err)
        setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`)
      }
    }

    testAuth()
  }, [])

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Simple Test</h1>
        
        <div className="bg-dark-800 p-6 rounded mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
          <p className="text-white">{status}</p>
        </div>

        {user && (
          <div className="bg-dark-800 p-6 rounded mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">User</h2>
            <pre className="text-green-400 text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        {profile && (
          <div className="bg-dark-800 p-6 rounded mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
            <pre className="text-blue-400 text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-dark-800 p-6 rounded">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/debug'}
              className="btn-primary w-full"
            >
              Go to Debug Page
            </button>
            <button 
              onClick={() => window.location.href = '/admin/test-dashboard'}
              className="btn-secondary w-full"
            >
              Go to Test Dashboard
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
  )
}

