'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewSubmissionsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to unified admin dashboard
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <main className="min-h-screen bg-black text-white p-6" aria-label="Redirecting">
      <div className="text-center">
        <div className="text-white mb-4">Redirecting to Admin Dashboard...</div>
        <div className="text-blue-400 text-sm">The submission review functionality is now part of the main admin dashboard.</div>
        <p className="sr-only">Redirecting to the Admin Dashboard</p>
      </div>
    </main>
  )
}
