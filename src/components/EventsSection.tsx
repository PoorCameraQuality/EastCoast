import Link from 'next/link'
import { getUpcomingEvents } from '@/data/events'
import EventLogo from './EventLogo'

export default function EventsSection() {
  const upcomingEvents = getUpcomingEvents()

  return (
    <section className="section-padding bg-dark-950">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Upcoming Events
          </h2>
          <p className="text-lg text-subtle max-w-3xl mx-auto leading-relaxed">
            Discover events happening across the East Coast. From workshops to parties, there&apos;s something for everyone in our inclusive community.
          </p>
        </div>

        {/* Mobile: Vertical card layout */}
        <div className="md:hidden space-y-6 mb-8">
          {upcomingEvents.slice(0, 3).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group cursor-pointer p-6">
                <div className="flex items-start space-x-4">
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
                      <span className="inline-block bg-primary-900 text-primary-300 text-xs font-medium px-3 py-1 rounded-none border border-primary-700">
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-serif font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <p className="text-sm text-subtle mb-2">
                      {event.date.display}
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
        
        {/* Desktop: Grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {upcomingEvents.map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group cursor-pointer">
                {/* Event Logo - Enhanced for uniformity */}
                {event.logo && (
                  <div className="mb-6">
                    <EventLogo 
                      src={event.logo} 
                      alt={`${event.name} logo`}
                      size="medium"
                    />
                  </div>
                )}
                
                <div className="mb-6">
                  <span className="inline-block bg-primary-900 text-primary-300 text-xs font-medium px-3 py-1 rounded-none border border-primary-700">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif font-semibold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  {event.name}
                </h3>
                
                <p className="text-sm text-subtle mb-4">
                  {event.date.display}
                </p>
                
                <p className="text-sm text-subtle mb-6">
                  📍 {event.location.city}, {event.location.state}
                </p>
                
                <p className="text-sm text-subtle mb-6 leading-relaxed">
                  {event.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/events" className="btn-primary">
            Browse More Events
          </Link>
        </div>
      </div>
    </section>
  )
} 