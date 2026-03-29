'use client'

import { useAuth } from '@/contexts/AuthProvider'
import AdminProtected from '@/components/AdminProtected'
import { useEffect, useState } from 'react'
import UnifiedAdminDashboard from '@/components/admin/UnifiedAdminDashboard'

export default function AdminDashboardClient() {
  const { user, loading, isAdmin } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading during SSR hydration or auth loading
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Loading user data...</div>
          <div className="text-primary-400 text-sm">Checking authentication...</div>
        </div>
      </div>
    )
  }

  // If not admin, AdminProtected will handle the redirect
  if (!isAdmin) {
    return (
      <AdminProtected>
        <div>Access Denied</div>
      </AdminProtected>
    )
  }

  return (
    <AdminProtected>
      <main className="min-h-screen bg-black text-white p-6" aria-label="Admin Dashboard">
        <UnifiedAdminDashboard user={user} isAdmin={isAdmin} />
      </main>
    </AdminProtected>
  )
}
