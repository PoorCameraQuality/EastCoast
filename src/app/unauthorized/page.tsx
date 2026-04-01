import Link from 'next/link'
import type { Metadata } from 'next'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Unauthorized',
  description: 'You do not have permission to access this page.',
  robots: 'noindex, nofollow',
  alternates: { canonical: `${BASE_URL}/unauthorized` }
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-brand-void flex items-center justify-center">
      <div className="container-custom py-8 md:py-16 w-full">
        <div className="max-w-md mx-auto">
          <div className="card-elegant text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                Access Denied
              </h1>
              <p className="text-subtle mb-6">
                You don&apos;t have permission to access this area. Please contact an administrator if you believe this is an error.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/"
                className="btn-primary flex w-full min-h-touch items-center justify-center"
                aria-label="Return to home page"
              >
                Return to Home
              </Link>

              <Link
                href="/contact"
                className="btn-secondary flex w-full min-h-touch items-center justify-center"
                aria-label="Contact support for assistance"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
