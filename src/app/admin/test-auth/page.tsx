'use client'

import { useAuth } from '@/contexts/AuthProvider'
import { supabase } from '@/lib/supabase'

export default function AuthTestPage() {
  const { user, loading, isAdmin } = useAuth()

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
              <p><strong>User:</strong> {user?.email ?? 'None'}</p>
              <p><strong>Role:</strong> {isAdmin ? 'admin' : 'user'}</p>
              <p><strong>Session:</strong> {user ? 'Active' : 'None'}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">User Details</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
              <p><strong>ID:</strong> {user?.id || 'Not available'}</p>
              <p><strong>Full Name:</strong> {user?.name || 'Not available'}</p>
              <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
            </div>
          </div>

          {/* User Role Details */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">User Role Details</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>User Active:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>User Role:</strong> {user?.role || 'Not available'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>User Name:</strong> {user?.name || 'Not available'}</p>
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
