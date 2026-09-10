'use client'

import AuthCrashFallback from '@/components/auth/AuthCrashFallback'
import '@/app/globals.css'

/**
 * Catches errors in the root layout (error.tsx does not).
 * Must define its own <html> and <body>.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-error
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isAuthShell =
    typeof window !== 'undefined' &&
    (/^\/auth(?:\/|$)/.test(window.location.pathname) || /^\/dashboard(?:\/|$)/.test(window.location.pathname))

  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-void text-gray-100 antialiased font-sans">
        {isAuthShell ? (
          <main className="container-custom px-4 py-12 md:py-16">
            <AuthCrashFallback />
          </main>
        ) : (
          <main className="mx-auto max-w-lg p-8">
            <h1 className="mb-4 font-serif text-2xl text-white">Something went wrong</h1>
            <p className="mb-6 text-gray-400">
              The site hit an unexpected error. You can try again, or refresh the page.
              {process.env.NODE_ENV === 'development' && error?.message ? (
                <span className="mt-4 block font-mono text-sm text-red-400">{error.message}</span>
              ) : null}
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="min-h-touch rounded-md bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-brand-void"
            >
              Try again
            </button>
          </main>
        )}
      </body>
    </html>
  )
}
