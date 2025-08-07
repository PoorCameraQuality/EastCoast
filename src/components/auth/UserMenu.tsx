'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './LoginForm'
import Link from 'next/link'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
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
    if (logoutLoading) return // Prevent multiple clicks
    
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

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <div className="login-modal-overlay">
        <div className="login-modal-content">
          <button
            onClick={() => setShowLogin(false)}
            className="absolute -top-4 -right-4 w-8 h-8 bg-dark-800 rounded-full flex items-center justify-center text-white hover:bg-dark-700 transition-colors z-10"
          >
            ×
          </button>
          <LoginForm />
        </div>
      </div>
    )
  }

  // Show admin tool button for administrators
  if (user && user.role === 'admin') {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/review-submissions"
          className="admin-mode-button text-white px-6 py-3 rounded-md transition-all duration-300 text-sm font-bold hover:scale-105 transform whitespace-nowrap"
        >
          🔥 ADMIN TOOL 🔥
        </Link>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="text-gray-300 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    )
  }

  // Show regular user menu for non-admin users
  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-300">
          <span className="font-medium">{user.name || user.email}</span>
        </div>
        <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
          User
        </span>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="text-gray-300 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    )
  }

  // Show sign in button for non-authenticated users
  return (
    <button
      onClick={() => setShowLogin(true)}
      className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm"
    >
      Sign In
    </button>
  )
}
