import { Metadata } from 'next'
import { getEventBySlug, generateEventSEO } from '@/data/events'
import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import { EventStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = getEventBySlug(params.slug)
  
  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.'
    }
  }

  const seo = generateEventSEO(event)
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
      type: 'website',
      url: `https://eastcoastkinkevents.com/events/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
    },
    alternates: {
      canonical: `https://eastcoastkinkevents.com/events/${params.slug}`,
    },
  }
}

// Generate static paths for all events
export async function generateStaticParams() {
  const { getAllEvents } = await import('@/data/events')
  const events = getAllEvents()
  
  return events.map((event) => ({
    slug: event.slug,
  }))
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = getEventBySlug(params.slug)

  if (!event) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Event Not Found</h1>
            <p className="text-subtle mb-8">The requested event could not be found.</p>
            <Link href="/events" className="btn-primary">
              Browse All Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: event.name, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <EventStructuredData event={event} />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link href="/events" className="text-primary-400 hover:text-primary-300 transition-colors">
              ← Back to Events
            </Link>
            <span className="inline-block bg-primary-900 text-primary-300 text-sm font-medium px-3 py-1 rounded-none border border-primary-700">
              {event.category}
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Logo and Basic Info */}
            <div className="lg:col-span-1">
              <div className="card-elegant">
                {/* Event Logo - Enhanced for uniformity */}
                {event.logo && (
                  <div className="mb-6">
                    <EventLogo 
                      src={event.logo} 
                      alt={`${event.name} logo`}
                      size="large"
                    />
                  </div>
                )}
                
                <h1 className="text-3xl font-serif font-bold text-white mb-4">
                  {event.name}
                </h1>
                
                <div className="space-y-4 text-subtle">
                  <div>
                    <span className="font-medium text-white">Date:</span>
                    <p>{event.date.display}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Location:</span>
                    <p>{event.location.city}, {event.location.state}</p>
                    <p className="text-sm">{event.location.region}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Category:</span>
                    <p>{event.category}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <a 
                    href={event.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center"
                  >
                    Visit Event Website
                  </a>
                </div>
              </div>
            </div>
            
            {/* Event Details */}
            <div className="lg:col-span-2">
              <div className="card-elegant">
                <h2 className="text-2xl font-serif font-semibold text-white mb-6">
                  About This Event
                </h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-subtle mb-6">
                    {event.excerpt}
                  </p>
                </div>
                
                {/* Event Information */}
                <div className="mt-8">
                  <h3 className="text-xl font-serif font-semibold text-white mb-4">
                    Event Information
                  </h3>
                  <div className="space-y-4 text-subtle">
                    <div>
                      <span className="font-medium text-white">Event Type:</span>
                      <p>{event.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Location:</span>
                      <p>{event.location.city}, {event.location.state}</p>
                      <p className="text-sm">{event.location.region}</p>
                    </div>
                    <div>
                      <span className="font-medium text-white">Dates:</span>
                      <p>{event.date.display}</p>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="mt-8">
                  <h3 className="text-xl font-serif font-semibold text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-subtle">
                    <p>
                      <span className="font-medium text-white">Website:</span>{' '}
                      <a 
                        href={event.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300"
                      >
                        {event.website}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Discord Community Section */}
        <div className="mt-16">
          <div className="card-elegant text-center">
            <h2 className="text-2xl font-serif font-semibold text-white mb-4">
              Connect with the Community
            </h2>
            <p className="text-lg text-subtle mb-6 max-w-2xl mx-auto">
              Join our Discord community! Your hub for all discussions kinky. Connect with event organizers, 
              ask questions, share experiences, and stay updated on the latest events and announcements.
            </p>
            <Link 
              href="https://discord.gg/xcnGGyGsmT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Join Discord Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 