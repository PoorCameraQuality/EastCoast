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

        {/* Mobile: Horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory mb-8">
          {pastEvents.slice(0, 4).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group opacity-75 flex-shrink-0 w-80 snap-start cursor-pointer">
                {/* Event Logo */}
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
                  <span className="inline-block bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-none border border-gray-600">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif font-semibold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  {event.name}
                </h3>
                
                <p className="text-sm text-subtle mb-4">
                  <span className="text-primary-400 font-medium">TBD</span>
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
          {pastEvents.slice(0, 4).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block">
              <div className="card-elegant hover-lift group opacity-75 cursor-pointer">
                {/* Event Logo */}
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
                  <span className="inline-block bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-none border border-gray-600">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif font-semibold text-white mb-4 group-hover:text-primary-400 transition-colors duration-300">
                  {event.name}
                </h3>
                
                <p className="text-sm text-subtle mb-4">
                  <span className="text-primary-400 font-medium">TBD</span>
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

