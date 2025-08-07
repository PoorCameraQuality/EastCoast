'use client'

import { getAllEvents, getEventsByCategory } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import { useState } from 'react'
import { EventListStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'

export default function EventsPageClient() {
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const categories = ['Outdoor Events', 'Indoor Events']
  const [selectedCategory, setSelectedCategory] = useState('All Events')

  // Map plural button labels to singular category values
  const getCategoryForFilter = (filterLabel: string) => {
    switch (filterLabel) {
      case 'Outdoor Events':
        return 'Outdoor Event'
      case 'Indoor Events':
        return 'Indoor Event'
      default:
        return filterLabel
    }
  }

  // Separate upcoming and past events dynamically
  const separateEventsByDate = (events: any[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingEvents = events.filter(event => {
      const eventEndDate = new Date(event.date.end)
      return eventEndDate >= today
    }).sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())

    const pastEvents = events.filter(event => {
      const eventEndDate = new Date(event.date.end)
      return eventEndDate < today
    }).sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime())

    return { upcomingEvents, pastEvents }
  }

  const baseEvents = selectedCategory === 'All Events'
    ? allEvents
    : getEventsByCategory(getCategoryForFilter(selectedCategory))

  const { upcomingEvents, pastEvents } = separateEventsByDate(baseEvents)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <EventListStructuredData />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            All Events
          </h1>
          <p className="text-lg text-subtle max-w-3xl mx-auto mb-8">
            Browse all upcoming and past kink events across the East Coast. Find conferences, workshops, and more.
          </p>

          {/* Search Component */}
          <div className="max-w-md mx-auto mb-8">
            <Search
              events={allEvents}
              dungeons={allDungeons}
              placeholder="Search events..."
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              key="all-events"
              onClick={() => setSelectedCategory('All Events')}
              className={selectedCategory === 'All Events' ? 'btn-primary' : 'btn-outline'}
            >
              All Events
            </button>
            {categories.map((category) => (
              <button 
                key={category} 
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6 text-center">
                Upcoming Events
              </h2>
            </div>
            
            {/* Mobile: Vertical card layout for upcoming events */}
            <div className="md:hidden space-y-6 mb-8">
              {upcomingEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block">
                  <div className="card-elegant hover-lift group cursor-pointer p-6">
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
            
            {/* Desktop: Grid layout for upcoming events */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {upcomingEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block">
                  <div className="card-elegant hover-lift group cursor-pointer p-6 h-96 flex flex-col">
                    {/* Event Logo - Enhanced for uniformity */}
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
                      <div className="mb-4">
                        <span className="inline-block bg-primary-900 text-primary-300 text-xs font-medium px-3 py-1 rounded-none border border-primary-700">
                          {event.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-serif font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                        {event.name}
                      </h3>
                      
                      <p className="text-sm text-subtle mb-3 flex-shrink-0">
                        {event.date.display}
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
          </>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-white mb-6 text-center">
                Past Events
              </h2>
            </div>
            
            {/* Mobile: Vertical card layout for past events */}
            <div className="md:hidden space-y-6 mb-8">
              {pastEvents.map((event: any) => (
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
            
            {/* Desktop: Grid layout for past events */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block">
                  <div className="card-elegant hover-lift group opacity-75 cursor-pointer p-6 h-96 flex flex-col">
                    {/* Event Logo - Enhanced for uniformity */}
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
                      <div className="mb-4">
                        <span className="inline-block bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-none border border-gray-600">
                          {event.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-serif font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                        {event.name}
                      </h3>
                      
                      <p className="text-sm text-subtle mb-3 flex-shrink-0">
                        {event.date.display}
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
          </>
        )}

        {/* No Events Message */}
        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-subtle text-lg">
              No events found for the selected category. Check back soon for new listings!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
