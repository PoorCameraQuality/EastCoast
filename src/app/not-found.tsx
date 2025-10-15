import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container-custom mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-serif font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-300 mb-6 text-lg">
          We couldn't find the page you're looking for. It may have been moved or deleted.
        </p>
        <div className="space-y-4">
          <p className="text-gray-400">Try exploring these sections:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>
              <Link href="/events" className="text-primary-400 hover:text-primary-300 underline">
                Browse Events
              </Link>
            </li>
            <li>
              <Link href="/dungeons" className="text-primary-400 hover:text-primary-300 underline">
                Find Dungeons
              </Link>
            </li>
            <li>
              <Link href="/education" className="text-primary-400 hover:text-primary-300 underline">
                Read Education Articles
              </Link>
            </li>
            <li>
              <Link href="/calendar" className="text-primary-400 hover:text-primary-300 underline">
                View Calendar
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
