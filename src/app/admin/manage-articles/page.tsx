import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import AdminNavigation from '@/components/admin/AdminNavigation'
import ArticleManagementPanel from '@/components/admin/ArticleManagementPanel'

export const metadata: Metadata = {
  title: 'Manage Articles - Admin | East Coast Kink Events',
  description: 'Admin panel for managing published articles, including editing and deletion with moderation logging.',
  robots: 'noindex, nofollow'
}

export default function ManageArticlesPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Manage Articles', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <AdminNavigation />
      <div className="container-custom py-16">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          <ArticleManagementPanel />
        </div>
      </div>
    </div>
  )
}
