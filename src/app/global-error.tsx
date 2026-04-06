'use client'

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
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-void text-gray-100 antialiased font-sans p-8">
        <main className="max-w-lg mx-auto">
          <h1 className="font-serif text-2xl text-white mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">
            The site hit an unexpected error. You can try again, or refresh the page.
            {process.env.NODE_ENV === 'development' && error?.message ? (
              <span className="block mt-4 text-sm text-red-400 font-mono">{error.message}</span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-touch px-6 py-3 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-brand-void"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
