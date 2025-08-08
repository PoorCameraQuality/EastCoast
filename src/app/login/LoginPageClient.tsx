'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPageClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check if user has admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          setError('Access denied. Admin privileges required.')
          await supabase.auth.signOut()
        }
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!supabase) {
      setError('Authentication is not configured. Please contact the administrator.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
      } else if (data.user) {
        console.log('User signed in:', data.user.email)
        
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          setError('Error checking user permissions. Please try again.')
          await supabase.auth.signOut()
        } else if (profile?.role === 'admin') {
          console.log('Admin access confirmed, redirecting...')
          setSuccess('Login successful! Redirecting to admin panel...')
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 1000)
        } else {
          console.log('User does not have admin role')
          setError('Access denied. Admin privileges required.')
          await supabase.auth.signOut()
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-serif font-bold text-lg">EC</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">
              Admin Login
            </h1>
            <p className="text-subtle">
              Sign in to access the admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-600 text-red-300 px-4 py-3 rounded-none">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-600 text-green-300 px-4 py-3 rounded-none">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-dark-600 rounded-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-dark-800 text-white"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-subtle hover:text-primary-400 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
