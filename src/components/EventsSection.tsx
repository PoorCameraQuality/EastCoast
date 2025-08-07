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

        {/* Mobile: Horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory mb-8">
          {upcomingEvents.map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group flex-shrink-0 w-80 snap-start cursor-pointer">
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