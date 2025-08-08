'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminTestPage() {
  const [status, setStatus] = useState('Loading...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const client = supabase
        if (!client) {
          setStatus('Supabase not configured')
          return
        }

        // Get current user
        const { data: { user }, error } = await client.auth.getUser()

        if (error || !user) {
          setStatus('Not authenticated')
          return
        }

        setUser(user)
        setStatus('Authenticated')

        // Check if user is admin
        const { data: profile, error: profileError } = await client
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setStatus('Error checking admin status')
          return
        }

        if (profile?.role === 'admin') {
          setStatus('Admin user')
        } else {
          setStatus('Regular user')
        }

      } catch (error) {
        console.error('Auth check error:', error)
        setStatus('Error checking authentication')
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Test Page</h1>
        
        <div className="bg-dark-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>Status:</strong> {status}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
