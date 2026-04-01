'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 bg-brand-void px-4 py-16 text-center">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">Something went wrong</h1>
      <p className="text-subtle max-w-md">
        This page hit an unexpected error. You can try again or return home.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button type="button" onClick={reset} className="btn-primary min-h-touch px-6">
          Try again
        </button>
        <Link href="/" className="btn-secondary min-h-touch inline-flex items-center justify-center px-6">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
