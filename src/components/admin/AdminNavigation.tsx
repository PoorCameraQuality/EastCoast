'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Review Submissions',
      href: '/admin/review-submissions',
      description: 'Review and approve/reject article submissions'
    }
    // Note: Manage Articles page removed - functionality can be added later if needed
  ]

  return (
    <div className="bg-dark-800 border-b border-dark-600 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <nav className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700'
                  }`}
                  title={item.description}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-sm text-gray-400">
            Admin Access
          </div>
        </div>
      </div>
    </div>
  )
}
