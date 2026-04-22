'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './LoginForm'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DANCECARD_DEFAULT_EVENT_PATH } from '@/lib/dancecard/nav'

function DancecardHeaderLink() {
  const pathname = usePathname()
  const onDancecard = pathname.startsWith('/dancecard')
  return (
    <Link
      href={DANCECARD_DEFAULT_EVENT_PATH}
      className={`text-sm font-medium min-h-touch inline-flex items-center px-2 rounded-lg transition-colors ${
        onDancecard
          ? 'text-primary-300 bg-primary-600/20 border border-primary-600/30'
          : 'text-primary-500 hover:text-primary-400'
      }`}
      aria-current={onDancecard ? 'page' : undefined}
    >
      Dancecard
    </Link>
  )
}

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const loginTriggerRef = useRef<HTMLButtonElement>(null)

  const closeLogin = useCallback(() => {
    setShowLogin(false)
    queueMicrotask(() => loginTriggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!showLogin) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeLogin()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLogin, closeLogin])

  useEffect(() => {
    // If Supabase is not configured, skip auth functionality
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial user
    const getUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
          // Close login modal if user is now logged in
          setShowLogin(false)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Listen for custom auth state change event
    const handleAuthStateChanged = () => {
      setShowLogin(false)
    }
    window.addEventListener('auth-state-changed', handleAuthStateChanged)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('auth-state-changed', handleAuthStateChanged)
    }
  }, [])

  const handleLogout = async () => {
    if (logoutLoading || !supabase) return // Prevent multiple clicks or if no Supabase
    
    try {
      setLogoutLoading(true)
      console.log('Logging out...')
      
      // Clear user state immediately for better UX
      setUser(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('Error logging out. Please try again.')
        setLogoutLoading(false)
        return
      }
      
      console.log('Logout successful')
      
      // Force a page refresh to ensure all auth state is cleared
      setTimeout(() => {
        window.location.reload()
      }, 100)
      
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out. Please try again.')
      setLogoutLoading(false)
    }
  }

  // If Supabase is not configured, show a simple login link
  if (!supabase) {
    return (
      <div className="flex items-center space-x-4">
        <DancecardHeaderLink />
        <Link href="/login" className="text-primary-500 hover:text-primary-400 transition-colors">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <div
        className="login-modal-overlay"
        role="presentation"
        onClick={closeLogin}
      >
        <div
          className="login-modal-content"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={closeLogin}
            aria-label="Close login dialog"
            className="absolute top-4 right-4 min-h-touch min-w-touch flex items-center justify-center text-gray-400 hover:text-white rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus"
          >
            <span aria-hidden="true">×</span>
          </button>
          <LoginForm />
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <DancecardHeaderLink />
        <div className="text-sm text-gray-300">
          Welcome, {user.email}
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
        >
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <DancecardHeaderLink />
      <button
        ref={loginTriggerRef}
        type="button"
        onClick={() => setShowLogin(true)}
        className="text-primary-500 hover:text-primary-400 transition-colors min-h-touch px-1"
      >
        Login
      </button>
    </div>
  )
}
