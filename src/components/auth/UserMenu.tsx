'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const getUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    if (logoutLoading || !supabase) return

    try {
      setLogoutLoading(true)
      setUser(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
        alert('Error logging out. Please try again.')
        setLogoutLoading(false)
        return
      }

      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
      setLogoutLoading(false)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-gray-300 lg:inline">Welcome, {user.email}</span>
      <button
        type="button"
        onClick={handleLogout}
        disabled={logoutLoading}
        className="text-sm text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50 min-h-touch px-1"
      >
        {logoutLoading ? 'Logging out…' : 'Logout'}
      </button>
    </div>
  )
}
