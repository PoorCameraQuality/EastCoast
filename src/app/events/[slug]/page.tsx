import { Metadata } from 'next'
import { getEventBySlug, generateEventSEO } from '@/data/events'
import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import { EventStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import Script from 'next/script'
import EventCalendarExport from '@/components/EventCalendarExport'
import { BASE_URL } from '@/lib/seo'

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
      url: `${BASE_URL}/events/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
    },
    alternates: {
      canonical: `${BASE_URL}/events/${params.slug}`,
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
      {/* Breadcrumb JSON-LD */}
      <Script
        id={`breadcrumb-structured-data-${event.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type": "ListItem", position: 1, name: 'Home', item: `${BASE_URL}/`},
              {"@type": "ListItem", position: 2, name: 'Events', item: `${BASE_URL}/events`},
              {"@type": "ListItem", position: 3, name: event.name, item: `${BASE_URL}/events/${event.slug}`}
            ]
          })
        }}
      />
      <EventStructuredData event={event} />
      
      <EnhancedEventLayout event={event} breadcrumbItems={breadcrumbItems} />
      
      {/* Related Content */}
      <div className="container-custom py-8">
        <RelatedContent currentEvent={event} />
      </div>
    </div>
  )
}

// Enhanced layout for all events with dynamic color schemes
function EnhancedEventLayout({ event, breadcrumbItems }: { event: any, breadcrumbItems: any[] }) {
  // Color scheme based on event type or category
  const getColorScheme = () => {
    // Special events with specific color schemes
    if (event.slug === 'primal-arts-festival') {
      return {
        primary: 'from-red-500 to-orange-500',
        secondary: 'from-orange-500 to-yellow-500',
        tertiary: 'from-yellow-500 to-red-500',
        accent: 'from-red-500 via-orange-500 to-yellow-500',
        hover: 'hover:text-red-400',
        buttonHover: 'hover:from-red-600 hover:via-orange-600 hover:to-yellow-600'
      }
    } else if (event.slug === 'dark-odyssey-summer-camp') {
      return {
        primary: 'from-blue-500 to-purple-500',
        secondary: 'from-purple-500 to-indigo-500',
        tertiary: 'from-indigo-500 to-blue-500',
        accent: 'from-blue-500 via-purple-500 to-indigo-500',
        hover: 'hover:text-blue-400',
        buttonHover: 'hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600'
      }
    }
    
    // Default color schemes based on category
    switch (event.category?.toLowerCase()) {
      case 'conference':
        return {
          primary: 'from-purple-500 to-pink-500',
          secondary: 'from-pink-500 to-rose-500',
          tertiary: 'from-rose-500 to-purple-500',
          accent: 'from-purple-500 via-pink-500 to-rose-500',
          hover: 'hover:text-purple-400',
          buttonHover: 'hover:from-purple-600 hover:via-pink-600 hover:to-rose-600'
        }
      case 'workshop':
        return {
          primary: 'from-emerald-500 to-teal-500',
          secondary: 'from-teal-500 to-cyan-500',
          tertiary: 'from-cyan-500 to-emerald-500',
          accent: 'from-emerald-500 via-teal-500 to-cyan-500',
          hover: 'hover:text-emerald-400',
          buttonHover: 'hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600'
        }
      case 'festival':
        return {
          primary: 'from-orange-500 to-amber-500',
          secondary: 'from-amber-500 to-yellow-500',
          tertiary: 'from-yellow-500 to-orange-500',
          accent: 'from-orange-500 via-amber-500 to-yellow-500',
          hover: 'hover:text-orange-400',
          buttonHover: 'hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600'
        }
      case 'party':
        return {
          primary: 'from-pink-500 to-rose-500',
          secondary: 'from-rose-500 to-red-500',
          tertiary: 'from-red-500 to-pink-500',
          accent: 'from-pink-500 via-rose-500 to-red-500',
          hover: 'hover:text-pink-400',
          buttonHover: 'hover:from-pink-600 hover:via-rose-600 hover:to-red-600'
        }
      default:
        return {
          primary: 'from-indigo-500 to-purple-500',
          secondary: 'from-purple-500 to-violet-500',
          tertiary: 'from-violet-500 to-indigo-500',
          accent: 'from-indigo-500 via-purple-500 to-violet-500',
          hover: 'hover:text-indigo-400',
          buttonHover: 'hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600'
        }
    }
  }
  
  const colors = getColorScheme()

  return (
    <div className="min-h-screen bg-black">
      {/* Compact Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          {event.slug === 'primal-arts-festival' ? (
            <>
              <div className="absolute top-4 left-4 w-16 h-16 bg-red-500 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute top-20 right-8 w-12 h-12 bg-orange-500 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-yellow-500 rounded-full blur-2xl animate-pulse delay-500"></div>
            </>
          ) : event.slug === 'dark-odyssey-summer-camp' ? (
            <>
              <div className="absolute top-4 left-4 w-16 h-16 bg-blue-500 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute top-20 right-8 w-12 h-12 bg-purple-500 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-indigo-500 rounded-full blur-2xl animate-pulse delay-500"></div>
            </>
          ) : (
            // Dynamic background based on color scheme
            <>
              <div className={`absolute top-4 left-4 w-16 h-16 bg-gradient-to-r ${colors.primary} rounded-full blur-2xl animate-pulse`}></div>
              <div className={`absolute top-20 right-8 w-12 h-12 bg-gradient-to-r ${colors.secondary} rounded-full blur-xl animate-pulse delay-1000`}></div>
              <div className={`absolute bottom-4 left-1/4 w-20 h-20 bg-gradient-to-r ${colors.tertiary} rounded-full blur-2xl animate-pulse delay-500`}></div>
            </>
          )}
        </div>
        
        <div className="container-custom py-8 relative z-10">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="max-w-6xl mx-auto">
            {/* Header Row */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
              {/* Logo and Title */}
              <div className="flex items-center gap-6">
                {event.logo && (
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.accent} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                    <EventLogo 
                      src={event.logo} 
                      alt={`${event.name} logo`}
                      size="medium"
                      className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                    {event.name.split(' ').map((word: string, index: number) => (
                      <span key={index} className={`inline-block ${colors.hover} transition-colors duration-300`}>
                        {word}{' '}
                      </span>
                    ))}
                  </h1>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-white text-sm">
                      {event.date.display}
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-white text-sm">
                      {event.location.city}, {event.location.state}
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-white text-sm">
                      {event.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <a 
                href={event.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`group inline-block bg-gradient-to-r ${colors.accent} text-black font-bold py-3 px-6 rounded-full ${colors.buttonHover} transition-all duration-300 shadow-xl hover:shadow-red-500/25 hover:scale-105 whitespace-nowrap`}
              >
                <span className="flex items-center gap-2">
                  Visit Website
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Content Section */}
      <section className="py-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - About & Features */}
              <div className="space-y-6">
                {/* About Section */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
                  <h2 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.primary} rounded-lg flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    About This Event
                  </h2>
                  <div className="text-gray-300 space-y-3">
                    <p className="text-lg leading-relaxed">{event.excerpt}</p>
                    {event.longDescription && (
                      <div className="text-gray-300 whitespace-pre-line text-sm">
                        {event.longDescription}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features Section */}
                {event.features && event.features.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
                    <h2 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${colors.secondary} rounded-lg flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Event Features
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-3 group">
                          <div className={`flex-shrink-0 w-6 h-6 bg-gradient-to-r ${colors.primary} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <span className="text-black font-bold text-xs">{index + 1}</span>
                          </div>
                          <span className={`text-gray-300 text-sm ${colors.hover} transition-colors`}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Event Details & Quick Info */}
              <div className="space-y-6">
                {/* Event Details Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.primary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Event Type</h3>
                    <p className="text-gray-300 text-sm">{event.category}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.secondary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Location</h3>
                    <p className="text-gray-300 text-sm">{event.location.city}, {event.location.state}</p>
                    <p className="text-gray-400 text-xs">{event.location.region}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.tertiary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Dates</h3>
                    <p className="text-gray-300 text-sm">{event.date.display}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-4 transition-all duration-300 hover:border-opacity-50 hover:border-current">
                    <div className={`w-8 h-8 bg-gradient-to-r ${colors.primary} rounded-lg flex items-center justify-center mb-3`}>
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-1">Website</h3>
                    <a 
                      href={event.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transition-colors underline text-sm break-all hover:text-gray-300"
                    >
                      {event.website}
                    </a>
                  </div>
                </div>

                {/* Calendar Export */}
                <EventCalendarExport event={event} />

                {/* Discord Community */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
                  <h2 className="text-xl font-serif font-bold text-white mb-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    Connect with Community
                  </h2>
                  <p className="text-gray-300 text-sm mb-4">
                    Join our Discord community! Connect with event organizers, ask questions, and stay updated.
                  </p>
                  <Link 
                    href="https://discord.gg/xcnGGyGsmT" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      Join Discord
                      <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Content */}
      <div className="container-custom py-8">
        <RelatedContent currentEvent={event} />
      </div>
    </div>
  )
} 