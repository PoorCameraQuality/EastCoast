'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthProvider'
import AdminProtected from '@/components/AdminProtected'
import { useEffect, useState } from 'react'

const UnifiedAdminDashboard = dynamic(
  () => import('@/components/admin/UnifiedAdminDashboard'),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-black text-gray-300"
        role="status"
        aria-live="polite"
      >
        <div
          className="h-10 w-10 rounded-full border-2 border-primary-500/30 border-t-primary-400 animate-spin"
          aria-hidden
        />
        <p className="text-sm">Loading admin tools…</p>
      </div>
    ),
  }
)

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
