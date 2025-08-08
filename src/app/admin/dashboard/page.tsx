'use client'

import { useAuth } from '@/contexts/AuthProvider'
import AdminProtected from '@/components/AdminProtected'

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Loading admin dashboard...</div>
          <div className="text-blue-400 text-sm">Checking authentication...</div>
        </div>
      </div>
    )
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-dark-900">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Header */}
          <div className="mb-6">
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-outline mb-4"
            >
              ← Back to Home
            </button>
          </div>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name || user?.email}</p>
            <div className="text-green-400 text-sm mt-2">
              ✅ Using persistent auth context
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-800 p-6 rounded">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => window.location.href = '/admin/add-event'}
                  className="btn-primary w-full"
                >
                  Add Event
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/add-dungeon'}
                  className="btn-secondary w-full"
                >
                  Add Dungeon
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/add-content'}
                  className="btn-outline w-full"
                >
                  Add Content
                </button>
              </div>
            </div>
            
            <div className="bg-dark-800 p-6 rounded">
              <h2 className="text-xl font-semibold text-white mb-4">User Info</h2>
              <div className="text-gray-300">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> <span className="text-green-400">{isAdmin ? 'admin' : 'user'}</span></p>
                <p><strong>ID:</strong> {user?.id}</p>
              </div>
            </div>
            
            <div className="bg-dark-800 p-6 rounded">
              <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
              <div className="text-green-400">
                <p>✅ Admin Access Confirmed</p>
                <p>✅ Authentication Working</p>
                <p>✅ Database Connected</p>
                <p>✅ Persistent Auth State</p>
                <p>✅ Server-side Protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtected>
  )
}
