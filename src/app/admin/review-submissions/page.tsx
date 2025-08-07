import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import AdminNavigation from '@/components/admin/AdminNavigation'
import SubmissionReviewPanel from '@/components/admin/SubmissionReviewPanel'

export const metadata: Metadata = {
  title: 'Review Submissions - Admin | East Coast Kink Events',
  description: 'Admin panel for reviewing and managing article submissions.',
  robots: 'noindex, nofollow'
}

export default function ReviewSubmissionsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Review Submissions', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <AdminNavigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
          <SubmissionReviewPanel />
        </div>
      </div>
    </div>
  )
}
