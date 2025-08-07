import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard | East Coast Kink Events',
  description: 'Admin dashboard for managing East Coast Kink Events website.',
  robots: 'noindex, nofollow'
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user.name || user.email}</p>
        </div>
        
        <AdminDashboardClient />
      </div>
    </div>
  )
}
