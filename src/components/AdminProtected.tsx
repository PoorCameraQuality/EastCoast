'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface AdminProtectedProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function AdminProtected({ children, fallback }: AdminProtectedProps) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Loading...</div>
          <div className="text-blue-400 text-sm">Checking admin permissions...</div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            {!user ? 'Not authenticated' : 'Admin access required'}
          </div>
          <p className="text-gray-400 mb-4">
            This feature is only available to administrators.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
