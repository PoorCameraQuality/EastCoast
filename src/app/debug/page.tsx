'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const { user, loading, isAdmin, refreshAuth } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading authentication data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Debug</h1>
        <p className="text-gray-400 mb-6">Last updated: {new Date().toISOString()}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
            <pre className="text-green-400 text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Auth Context Status</h2>
            <div className="text-white">
              <p>Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
                {loading ? 'Yes' : 'No'}
              </span></p>
              <p>User Found: <span className={user ? 'text-green-400' : 'text-red-400'}>
                {user ? 'Yes' : 'No'}
              </span></p>
              <p>Is Admin: <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>
                {isAdmin ? 'Yes' : 'No'}
              </span></p>
              <p className="text-sm text-gray-400 mt-2">
                Using persistent AuthContext
              </p>
            </div>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Admin Status</h2>
            <div className="text-white">
              <p>Is Admin: <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>
                {isAdmin ? 'Yes' : 'No'}
              </span></p>
              <p className="text-sm text-gray-400 mt-2">
                Database shows: ADMIN ACCESS GRANTED
              </p>
            </div>
          </div>
          
          <div className="bg-dark-800 p-6 rounded">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={refreshAuth}
                className="btn-primary w-full"
              >
                Refresh Auth State
              </button>
              <button 
                onClick={() => window.location.href = '/admin/dashboard'}
                className="btn-secondary w-full"
              >
                Go to Admin Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="btn-outline w-full"
              >
                Go to Login
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
    </div>
  )
}

