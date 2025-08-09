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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white mb-4">Redirecting to Admin Dashboard...</div>
        <div className="text-blue-400 text-sm">The submission review functionality is now part of the main admin dashboard.</div>
      </div>
    </div>
  )
}
