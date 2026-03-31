import { Metadata } from 'next'
import Link from 'next/link'
import EventCard from '@/components/EventCard'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_URL } from '@/lib/seo'
import { getUnifiedEvents, getUpcomingUnified, unifiedEventToEventsPageShape } from '@/lib/unifiedEvents'

const EVENTS_PER_PAGE = 20

export const revalidate = 1800

interface PageProps {
  params: { page: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pageNum = Math.max(1, parseInt(params.page) || 1)
  const merged = await getUnifiedEvents()
  const upcomingEvents = getUpcomingUnified(merged)
  const totalPages = Math.max(1, Math.ceil(upcomingEvents.length / EVENTS_PER_PAGE))
  const description = `Upcoming kink events — page ${pageNum} of ${totalPages}. Browse BDSM conferences and workshops across the East Coast.`

  return {
    title: `Events - Page ${pageNum} | East Coast Kink Events`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `${BASE_URL}/events/page/${pageNum}`,
    },
    // Consolidate ranking on /events (first page); paginated URLs stay crawlable via rel + internal links.
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: `Events - Page ${pageNum}`,
      description: description.slice(0, 200),
      type: 'website',
      url: `${BASE_URL}/events/page/${pageNum}`,
      siteName: 'East Coast Kink Events',
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'East Coast Kink Events' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Events - Page ${pageNum}`,
      description: description.slice(0, 200),
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}

// Generate static paths for the first few pages
export async function generateStaticParams() {
  const merged = await getUnifiedEvents()
  const upcomingEvents = getUpcomingUnified(merged)
  const totalPages = Math.ceil(upcomingEvents.length / EVENTS_PER_PAGE)
  
  // Pre-generate first 5 pages at build time
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => ({
    page: String(i + 1),
  }))
}

export default async function EventsPageNumber({ params }: PageProps) {
  const pageNum = Math.max(1, parseInt(params.page) || 1)

  const merged = await getUnifiedEvents()
  const upcomingEvents = getUpcomingUnified(merged).map(unifiedEventToEventsPageShape)
  
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
        <div className="container-custom py-8 md:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-gray-300 mb-6">
              There are only {totalPages} pages of events.
            </p>
            <Link 
              href={`/events/page/${totalPages}`}
              className="inline-flex min-h-touch items-center justify-center text-primary-400 hover:text-primary-300"
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
      <div className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
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
          className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-12"
          aria-label="Pagination"
        >
          {pageNum > 1 && (
            <>
              <Link
                href={pageNum === 2 ? '/events' : `/events/page/${pageNum - 1}`}
                rel="prev"
                className="btn-primary inline-flex min-h-touch items-center justify-center px-6 py-2.5 text-sm"
              >
                ← Previous
              </Link>
            </>
          )}

          <span className="text-gray-300 font-medium text-center py-2">
            Page {pageNum} of {totalPages}
          </span>

          {pageNum < totalPages && (
            <Link
              href={`/events/page/${pageNum + 1}`}
              rel="next"
              className="btn-primary inline-flex min-h-touch items-center justify-center px-6 py-2.5 text-sm"
            >
              Next →
            </Link>
          )}
        </nav>

        {/* Link to all events */}
        <div className="text-center mt-12">
          <Link 
            href="/events"
            className="inline-flex min-h-touch items-center justify-center text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all events (no pagination) →
          </Link>
        </div>
      </div>
    </div>
  )
}

