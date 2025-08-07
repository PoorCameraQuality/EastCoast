import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import ModerationLogsClient from '@/components/admin/ModerationLogsClient'

export default async function ModerationLogs() {
  const user = await getCurrentUser()
  
  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Moderation Logs</h1>
          <p className="text-gray-400">View all admin actions and changes</p>
        </div>
        
        <ModerationLogsClient />
      </div>
    </div>
  )
}
