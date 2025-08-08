'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminTestPage() {
  const [status, setStatus] = useState('Loading...')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          setStatus('Supabase not configured')
          return
        }

        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          setStatus('Not authenticated')
          return
        }

        setUser(user)
        setStatus('Authenticated, checking admin status...')

        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setStatus(`Profile error: ${profileError.message}`)
          return
        }

        setProfile(profile)

        if (profile.role === 'admin') {
          setStatus('ADMIN ACCESS CONFIRMED')
        } else {
          setStatus(`User role: ${profile.role}`)
        }

      } catch (err) {
        setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Test</h1>
        
        <div className="bg-dark-800 p-6 rounded mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-2xl font-bold text-green-400">{status}</p>
        </div>

        {user && (
          <div className="bg-dark-800 p-6 rounded mb-6">
            <h2 className="text-xl font-semibold mb-4">User</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
          </div>
        )}

        {profile && (
          <div className="bg-dark-800 p-6 rounded mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p>Role: <span className="text-blue-400">{profile.role}</span></p>
            <p>Email: {profile.email}</p>
          </div>
        )}

        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="btn-primary w-full"
          >
            Try Admin Dashboard
          </button>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-secondary w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
