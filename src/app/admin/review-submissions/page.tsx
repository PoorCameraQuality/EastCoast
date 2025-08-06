import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
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
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Review Submissions
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              Review and manage article submissions from the community.
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">0</div>
              <div className="text-sm text-subtle">Pending Review</div>
            </div>
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">0</div>
              <div className="text-sm text-subtle">Approved</div>
            </div>
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">0</div>
              <div className="text-sm text-subtle">Rejected</div>
            </div>
            <div className="card-elegant text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
              <div className="text-sm text-subtle">Total Submissions</div>
            </div>
          </div>

          {/* Review Panel */}
          <SubmissionReviewPanel />
        </div>
      </div>
    </div>
  )
}
