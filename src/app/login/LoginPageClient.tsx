'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthProvider'
import { supabase } from '@/lib/supabase'

export default function LoginPageClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  useEffect(() => {
    // If user is already logged in and is admin, redirect to dashboard
    if (!authLoading && user && isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [user, isAdmin, authLoading, router])

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        setError('Supabase not configured')
        return
      }
      await supabase.auth.signOut()
      setMessage('Signed out successfully')
      setError('')
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Error signing out')
    }
  }

  const handleSignOutAndRedirect = async () => {
    try {
      if (!supabase) {
        setError('Supabase not configured')
        return
      }
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Error signing out')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (loading) {
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!supabase) {
        setError('Supabase not configured')
        return
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setError('Invalid email or password')
        return
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError || profile?.role !== 'admin') {
          if (supabase) {
            await supabase.auth.signOut()
          }
          setError('Access denied. Admin privileges required.')
          return
        }

        setMessage('Login successful! Redirecting...')
        // The AuthProvider will handle the redirect automatically
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 1000)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Loading...</div>
          <div className="text-blue-400 text-sm">Checking authentication...</div>
        </div>
      </div>
    )
  }

  // If already logged in as admin, show redirect message
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Already logged in!</div>
          <div className="text-blue-400 text-sm">Redirecting to admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
                <div className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Sign in to access the admin panel</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-label="Email address"
                className="w-full min-h-touch px-3 py-2 bg-dark-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label="Password"
                className="w-full min-h-touch px-3 py-2 bg-dark-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-label={loading ? 'Signing in, please wait' : 'Sign in to admin panel'}
              className="w-full min-h-touch inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              aria-label="Return to home page"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
