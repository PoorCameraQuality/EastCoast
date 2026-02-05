import { Metadata } from 'next'
import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import EventCard from '@/components/EventCard'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_URL } from '@/lib/seo'

const EVENTS_PER_PAGE = 20

interface PageProps {
  params: { page: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pageNum = Math.max(1, parseInt(params.page) || 1)
  
  return {
    title: `Events - Page ${pageNum} | East Coast Kink Events`,
    description: `Browse kink events, BDSM conferences, and workshops across the East Coast. Page ${pageNum} of our event listings.`,
    alternates: {
      canonical: `${BASE_URL}/events/page/${pageNum}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Generate static paths for the first few pages
export async function generateStaticParams() {
  const events = getAllEvents()
  const upcomingEvents = events.filter(event => new Date(event.date.end) >= new Date())
  const totalPages = Math.ceil(upcomingEvents.length / EVENTS_PER_PAGE)
  
  // Pre-generate first 5 pages at build time
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => ({
    page: String(i + 1),
  }))
}

export default function EventsPageNumber({ params }: PageProps) {
  const pageNum = Math.max(1, parseInt(params.page) || 1)
  
  // Get all upcoming events
  const allEvents = getAllEvents()
  const now = new Date()
  const upcomingEvents = allEvents
    .filter(event => new Date(event.date.end) >= now)
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
  
  // Calculate pagination
  const totalEvents = upcomingEvents.length
  const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE)
  const startIndex = (pageNum - 1) * EVENTS_PER_PAGE
  const endIndex = startIndex + EVENTS_PER_PAGE
  const paginatedEvents = upcomingEvents.slice(startIndex, endIndex)
  
  // If page number is too high, show last page
  if (pageNum > totalPages && totalPages > 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-gray-300 mb-6">
              There are only {totalPages} pages of events.
            </p>
            <Link 
              href={`/events/page/${totalPages}`}
              className="text-primary-400 hover:text-primary-300"
            >
              Go to last page →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: `Page ${pageNum}`, href: `/events/page/${pageNum}`, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Upcoming Events - Page {pageNum}
          </h1>
          <p className="text-gray-300">
            Showing {startIndex + 1}-{Math.min(endIndex, totalEvents)} of {totalEvents} events
          </p>
        </div>

        {/* Events Grid */}
        {paginatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginatedEvents.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events found on this page.</p>
          </div>
        )}

        {/* Pagination Controls */}
        <nav 
          className="flex items-center justify-center gap-4 mt-12"
          aria-label="Pagination"
        >
          {pageNum > 1 && (
            <>
              <Link
                href={pageNum === 2 ? '/events' : `/events/page/${pageNum - 1}`}
                rel="prev"
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-medium rounded-full hover:from-primary-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                ← Previous
              </Link>
            </>
          )}

          <span className="text-gray-300 font-medium">
            Page {pageNum} of {totalPages}
          </span>

          {pageNum < totalPages && (
            <Link
              href={`/events/page/${pageNum + 1}`}
              rel="next"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-medium rounded-full hover:from-primary-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              Next →
            </Link>
          )}
        </nav>

        {/* Link to all events */}
        <div className="text-center mt-12">
          <Link 
            href="/events"
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all events (no pagination) →
          </Link>
        </div>
      </div>
    </div>
  )
}

