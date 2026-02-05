'use client'

import { getAllEvents, getEventsByCategory } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { EventListStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import SupportCTAInline from '@/components/SupportCTAInline'

export default function EventsPageClient() {
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const categories = useMemo(() => ['Outdoor Events', 'Indoor Events'], [])
  const [selectedCategory, setSelectedCategory] = useState('All Events')
  const searchParams = useSearchParams()

  // Handle URL parameters for filtering
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const locationParam = searchParams.get('location')
    
    if (categoryParam) {
      // Map URL category to display category
      const decodedCategory = decodeURIComponent(categoryParam)
      if (categories.includes(decodedCategory)) {
        setSelectedCategory(decodedCategory)
      }
    } else if (locationParam) {
      // For location filtering, we'll use "All Events" but show filtered results
      const decodedLocation = decodeURIComponent(locationParam)
      setSelectedCategory(`Location: ${decodedLocation}`)
    }
  }, [searchParams, categories])

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

  // Filter events based on selected category or location
  const getFilteredEvents = () => {
    const locationParam = searchParams.get('location')
    
    if (locationParam) {
      // Filter by location
      const decodedLocation = decodeURIComponent(locationParam)
      return allEvents.filter(event => 
        event.location.state.toLowerCase().includes(decodedLocation.toLowerCase()) ||
        event.location.city.toLowerCase().includes(decodedLocation.toLowerCase())
      )
    } else if (selectedCategory === 'All Events') {
      return allEvents
    } else if (selectedCategory.startsWith('Location: ')) {
      // Handle location category display
      const location = selectedCategory.replace('Location: ', '')
      return allEvents.filter(event => 
        event.location.state.toLowerCase().includes(location.toLowerCase()) ||
        event.location.city.toLowerCase().includes(location.toLowerCase())
      )
    } else {
      return getEventsByCategory(getCategoryForFilter(selectedCategory))
    }
  }

  const baseEvents = getFilteredEvents()
  const { upcomingEvents, pastEvents } = separateEventsByDate(baseEvents)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events', current: true }
  ]

  // Event submissions route through /contact.

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <EventListStructuredData />
      <div className="container-custom py-16 relative z-10">
        <Breadcrumb items={breadcrumbItems} />
        <SupportCTAInline contextLabel="Events" />
        
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 relative">
            <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
              All Events
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Browse all upcoming and past kink events across the East Coast. Find conferences, workshops, and more.
          </p>

          {/* Enhanced Search Component */}
          <div className="max-w-md mx-auto mb-8">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <Search
                events={allEvents}
                dungeons={allDungeons}
                placeholder="Search events..."
              />
            </div>
          </div>

          {/* Event submission guidance */}
          <div className="mb-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary-600/15 border border-primary-500/25 text-primary-200 hover:bg-primary-600/25 hover:border-primary-400/35 transition"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              key="all-events"
              onClick={() => setSelectedCategory('All Events')}
              className={`group inline-block px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-xl hover:scale-105 ${
                selectedCategory === 'All Events' 
                  ? 'bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white hover:from-primary-700 hover:via-blue-700 hover:to-primary-800 hover:shadow-primary-500/25' 
                  : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:shadow-white/25'
              }`}
            >
              <span className="flex items-center gap-2">
                All Events
                {selectedCategory === 'All Events' && (
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            </button>
            {categories.map((category) => (
              <button 
                key={category} 
                onClick={() => setSelectedCategory(category)}
                className={`group inline-block px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-xl hover:scale-105 ${
                  selectedCategory === category 
                    ? 'bg-gradient-to-r from-primary-600 via-blue-600 to-primary-700 text-white hover:from-primary-700 hover:via-blue-700 hover:to-primary-800 hover:shadow-primary-500/25' 
                    : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:shadow-white/25'
                }`}
              >
                <span className="flex items-center gap-2">
                  {category}
                  {selectedCategory === category && (
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <>
            <div className="mb-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 relative">
                  <span className="inline-block bg-gradient-to-r from-primary-400 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                    Upcoming Events
                  </span>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  Discover what's happening next in the community. Don't miss out on these exciting opportunities to connect and learn.
                </p>
              </div>
            </div>
            
            {/* Mobile: Enhanced card layout for upcoming events */}
            <div className="md:hidden space-y-6 mb-12">
              {upcomingEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block group">
                  <div className="relative overflow-hidden backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-primary-500/20">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 p-6">
                      {/* Event Logo */}
                      {event.logo && (
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <EventLogo 
                              src={event.logo} 
                              alt={event.altText || `Promotional image for ${event.name}`}
                              size="large"
                              className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                            />
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
                          <p className="text-gray-300 text-sm">
                            {event.location.city}, {event.location.state}
                          </p>
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
            
            {/* Desktop: Enhanced grid layout for upcoming events */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {upcomingEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block group">
                  <div className="relative overflow-hidden backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 h-[480px] flex flex-col shadow-2xl hover:shadow-primary-500/20">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                      {/* Event Logo */}
                      {event.logo && (
                        <div className="mb-6 flex-shrink-0">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <EventLogo 
                              src={event.logo} 
                              alt={event.altText || `Promotional image for ${event.name}`}
                              size="medium"
                              className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                            />
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
          </>
        )}

        {/* Enhanced Past Events Section */}
        {pastEvents.length > 0 && (
          <>
            <div className="mb-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 relative">
                  <span className="inline-block bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400 bg-clip-text text-transparent">
                    Past Events
                  </span>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full"></div>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  Relive the memories from previous events. Check back for future dates and new experiences.
                </p>
              </div>
            </div>
            
            {/* Mobile: Enhanced card layout for past events */}
            <div className="md:hidden space-y-6 mb-12">
              {pastEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block group">
                  <div className="relative overflow-hidden backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-[1.02] shadow-2xl hover:shadow-gray-500/20 opacity-80 hover:opacity-100">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 via-transparent to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 p-6">
                      {/* Event Logo */}
                      {event.logo && (
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <EventLogo 
                              src={event.logo} 
                              alt={event.altText || `Promotional image for ${event.name}`}
                              size="large"
                              className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Event Details */}
                      <div className="text-center">
                        <div className="mb-4">
                          <span className="inline-block backdrop-blur-sm bg-gray-500/20 text-gray-300 text-xs font-semibold px-4 py-2 rounded-full border border-gray-400/30">
                            {event.category}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
                          {event.name}
                        </h3>
                        
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-400 font-medium text-sm">
                            {event.date.display}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-gray-500 text-sm">
                            {event.location.city}, {event.location.state}
                          </p>
                        </div>
                        
                        <p className="text-gray-500 leading-relaxed line-clamp-3">
                          {event.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Desktop: Enhanced grid layout for past events */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="block group">
                  <div className="relative overflow-hidden backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 h-[480px] flex flex-col shadow-2xl hover:shadow-gray-500/20 opacity-80 hover:opacity-100">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 via-transparent to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 p-6 flex flex-col h-full">
                      {/* Event Logo */}
                      {event.logo && (
                        <div className="mb-6 flex-shrink-0">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <EventLogo 
                              src={event.logo} 
                              alt={event.altText || `Promotional image for ${event.name}`}
                              size="medium"
                              className="relative bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <div className="mb-4 flex-shrink-0">
                          <span className="inline-block backdrop-blur-sm bg-gray-500/20 text-gray-300 text-xs font-semibold px-4 py-2 rounded-full border border-gray-400/30">
                            {event.category}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-serif font-bold text-white mb-3 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2 flex-shrink-0">
                          {event.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-400 font-medium text-sm">
                            {event.date.display}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-gray-500 text-sm">
                            {event.location.city}, {event.location.state}
                          </p>
                        </div>
                        
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <p className="text-gray-500 leading-relaxed line-clamp-4">
                            {event.excerpt}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Enhanced No Events Message */}
        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
              <p className="text-gray-400">
                No events found for the selected category. Check back soon for new listings!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
