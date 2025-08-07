import Link from 'next/link'
import { getPastEvents } from '@/data/events'
import EventLogo from './EventLogo'

export default function PastEventsSection() {
  const pastEvents = getPastEvents()

  if (pastEvents.length === 0) {
    return null
  }

  return (
    <section className="section-padding bg-black">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Past Events
          </h2>
          <p className="text-lg text-subtle max-w-3xl mx-auto leading-relaxed">
            These events have concluded. Check back for future dates and new events.
          </p>
        </div>

        {/* Mobile: Vertical card layout */}
        <div className="md:hidden space-y-6 mb-8">
          {pastEvents.slice(0, 3).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group opacity-75 cursor-pointer p-6">
                <div className="flex items-start space-x-3">
                  {/* Event Logo */}
                  {event.logo && (
                    <div className="flex-shrink-0">
                      <EventLogo 
                        src={event.logo} 
                        alt={`${event.name} logo`}
                        size="small"
                      />
                    </div>
                  )}
                  
                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <span className="inline-block bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-none border border-gray-600">
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-serif font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <p className="text-sm text-subtle mb-2">
                      <span className="text-primary-400 font-medium">TBD</span>
                    </p>
                    
                    <p className="text-sm text-subtle mb-3">
                      📍 {event.location.city}, {event.location.state}
                    </p>
                    
                    <p className="text-sm text-subtle leading-relaxed line-clamp-3">
                      {event.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Desktop: Grid layout with proper height management */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {pastEvents.slice(0, 4).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group opacity-75 cursor-pointer p-6 h-96 flex flex-col">
                {/* Event Logo */}
                {event.logo && (
                  <div className="mb-4 flex-shrink-0">
                    <EventLogo 
                      src={event.logo} 
                      alt={`${event.name} logo`}
                      size="medium"
                    />
                  </div>
                )}
                
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="mb-4 flex-shrink-0">
                    <span className="inline-block bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-none border border-gray-600">
                      {event.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-serif font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                    {event.name}
                  </h3>
                  
                  <p className="text-sm text-subtle mb-3 flex-shrink-0">
                    <span className="text-primary-400 font-medium">TBD</span>
                  </p>
                  
                  <p className="text-sm text-subtle mb-4 flex-shrink-0">
                    📍 {event.location.city}, {event.location.state}
                  </p>
                  
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <p className="text-sm text-subtle leading-relaxed line-clamp-4">
                      {event.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {pastEvents.length > 4 && (
          <div className="text-center">
            <Link href="/events" className="btn-secondary">
              View All Past Events
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

