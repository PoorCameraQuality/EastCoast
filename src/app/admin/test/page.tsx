import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function AdminTest() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">No User Found</h1>
            <p className="text-gray-400">You are not logged in.</p>
          </div>
        </div>
      )
    }

    if (user.role !== 'admin') {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400">User role: {user.role}</p>
            <p className="text-gray-400">Email: {user.email}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Confirmed!</h1>
          <p className="text-gray-400">User role: {user.role}</p>
          <p className="text-gray-400">Email: {user.email}</p>
          <p className="text-gray-400">ID: {user.id}</p>
          <a href="/admin/dashboard" className="text-primary-400 hover:text-primary-300 mt-4 inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in admin test:', error)
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-400">An error occurred while checking admin access.</p>
        </div>
      </div>
    )
  }
}
