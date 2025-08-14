import Link from 'next/link'
import { getUpcomingEvents } from '@/data/events'
import EventLogo from './EventLogo'

export default function EventsSection() {
  const upcomingEvents = getUpcomingEvents()

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 relative">
            <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
              Upcoming Events
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover events happening across the East Coast. From workshops to parties, there&apos;s something for everyone in our inclusive community.
          </p>
        </div>

        {/* Mobile: Refined card layout */}
        <div className="md:hidden space-y-6 mb-12">
          {upcomingEvents.slice(0, 3).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block group">
              <div className="relative overflow-hidden backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 hover:border-primary-400/30 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-primary-500/10">
                {/* Subtle background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-6">
                  {/* Event Logo */}
                  {event.logo && (
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <EventLogo 
                          src={event.logo} 
                          alt={`${event.name} logo - ${event.category} event in ${event.location.city}, ${event.location.state}`}
                          size="large"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/10 to-blue-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Event Details */}
                  <div className="text-center">
                    <div className="mb-4">
                      <span className="inline-block backdrop-blur-sm bg-primary-500/20 text-primary-300 text-xs font-semibold px-4 py-2 rounded-full border border-primary-400/30">
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-primary-300 transition-colors duration-300 line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-primary-300 font-medium text-sm">
                        {event.date.display}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Link 
                          href={`/events?category=${encodeURIComponent(event.category)}`}
                          className="text-primary-300 hover:text-primary-200 text-sm transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.category}
                        </Link>
                        <span className="text-gray-400">•</span>
                        <Link 
                          href={`/events?location=${encodeURIComponent(event.location.state)}`}
                          className="text-gray-300 hover:text-white text-sm transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.location.city}, {event.location.state}
                        </Link>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 leading-relaxed line-clamp-3">
                      {event.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Desktop: Refined grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.slice(0, 6).map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`} className="block group">
              <div className="relative overflow-hidden backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 hover:border-primary-400/30 transition-all duration-500 hover:scale-105 h-[480px] flex flex-col shadow-2xl hover:shadow-primary-500/10">
                {/* Subtle background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-6 flex flex-col h-full">
                  {/* Event Logo */}
                  {event.logo && (
                    <div className="mb-6 flex-shrink-0">
                      <div className="relative">
                        <EventLogo 
                          src={event.logo}
                          alt={`${event.name} logo - ${event.category} event in ${event.location.city}, ${event.location.state}`}
                          size="medium"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/10 to-blue-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4 flex-shrink-0">
                      <span className="inline-block backdrop-blur-sm bg-primary-500/20 text-primary-300 text-xs font-semibold px-4 py-2 rounded-full border border-primary-400/30">
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-primary-300 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                      {event.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-primary-300 font-medium text-sm">
                        {event.date.display}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-300 text-sm">
                        {event.location.city}, {event.location.state}
                      </p>
                    </div>
                    
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <p className="text-gray-400 leading-relaxed line-clamp-4">
                        {event.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/events" className="group relative inline-flex items-center justify-center px-8 py-4 backdrop-blur-xl bg-gradient-to-r from-primary-600/80 to-blue-600/80 text-white font-semibold rounded-full shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 hover:scale-105 overflow-hidden border border-white/20 hover:border-primary-400/40">
            <span className="relative z-10 flex items-center gap-2">
              Browse More Events
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700/80 to-blue-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </div>
    </section>
  )
} 
