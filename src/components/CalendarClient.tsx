'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface CalendarEvent {
  slug: string
  name: string
  date: {
    start: string
    end: string
    display: string
  }
  category: string
  location: {
    city: string
    state: string
  }
}

interface CalendarClientProps {
  allEvents: CalendarEvent[]
}

export default function CalendarClient({ allEvents }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get current month/year
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Generate calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const dateIterator = new Date(startDate)

    while (dateIterator <= lastDay || dateIterator.getDay() !== 0) {
      days.push(new Date(dateIterator))
      dateIterator.setDate(dateIterator.getDate() + 1)
    }

    return days
  }, [currentYear, currentMonth])

  // Get events for the current month
  const monthEvents = useMemo(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    return allEvents.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      
      // Event overlaps with current month
      return eventStart <= endOfMonth && eventEnd >= startOfMonth
    })
  }, [allEvents, currentYear, currentMonth])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateISO = date.toISOString().split('T')[0]
    
    return monthEvents.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      const checkDate = new Date(date)
      
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

  // Check if date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Check if event is in the past
  const isPastEvent = (event: CalendarEvent) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventEnd = new Date(event.date.end)
    return eventEnd < today
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get category color
  const getCategoryColor = (category: string, isPast: boolean) => {
    if (isPast) return 'bg-gray-500'
    
    switch (category) {
      case 'Outdoor Event':
        return 'bg-green-600'
      case 'Indoor Event':
        return 'bg-primary-600'
      case 'Conference':
        return 'bg-purple-600'
      case 'Workshop':
        return 'bg-yellow-600'
      case 'Party':
        return 'bg-pink-600'
      default:
        return 'bg-primary-600'
    }
  }

  // Export to Google Calendar
  const exportToGoogleCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    
    // Format dates for Google Calendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`${event.name} - ${event.date.display}\nLocation: ${event.location.city}, ${event.location.state}\n\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`)}&location=${encodeURIComponent(`${event.location.city}, ${event.location.state}`)}`
    
    window.open(googleCalendarUrl, '_blank')
  }

  // Export to iCal
  const exportToICal = (event: CalendarEvent) => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    
    // Format dates for iCal (YYYYMMDDTHHMMSSZ)
    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.slug}@eastcoastkinkevents.com`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
      `LOCATION:${event.location.city}, ${event.location.state}`,
      `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    
    // Create and download the .ics file
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.slug}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export all month events to Google Calendar
  const exportMonthToGoogleCalendar = () => {
    if (monthEvents.length === 0) return
    
    const startDate = new Date(currentYear, currentMonth, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 0)
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const eventList = monthEvents.map(event => 
      `${event.name} - ${event.date.display} (${event.location.city}, ${event.location.state})`
    ).join('\n')
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`East Coast Kink Events - ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Events for ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:\n\n${eventList}\n\nView all events: https://www.eastcoastkinkevents.com/calendar`)}`
    
    window.open(googleCalendarUrl, '_blank')
  }

  // Export all month events to iCal
  const exportMonthToICal = () => {
    if (monthEvents.length === 0) return
    
    const startDate = new Date(currentYear, currentMonth, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 0)
    
    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN'
    ]
    
    monthEvents.forEach(event => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.slug}@eastcoastkinkevents.com`,
        `DTSTART:${formatDateForICal(eventStart)}`,
        `DTEND:${formatDateForICal(eventEnd)}`,
        `SUMMARY:${event.name}`,
        `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
        `LOCATION:${event.location.city}, ${event.location.state}`,
        `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
        'END:VEVENT'
      )
    })
    
    icalContent.push('END:VCALENDAR')
    
    // Create and download the .ics file
    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `east-coast-kink-events-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Add to Apple Calendar
  const addToAppleCalendar = (event: CalendarEvent) => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    
    // Format dates for iCal (YYYYMMDDTHHMMSSZ)
    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.slug}@eastcoastkinkevents.com`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
      `LOCATION:${event.location.city}, ${event.location.state}`,
      `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    
    // Create data URL for Apple Calendar integration
    const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icalContent)}`
    
    // Try to open with Apple Calendar if on macOS/iOS, otherwise download
    if (navigator.userAgent.includes('Mac') || navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // On Apple devices, try to open with calendar app
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${event.slug}.ics`
      link.click()
    } else {
      // On other devices, download the file
      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${event.slug}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Add all month events to Apple Calendar
  const addMonthToAppleCalendar = () => {
    if (monthEvents.length === 0) return
    
    const startDate = new Date(currentYear, currentMonth, 1)
    const endDate = new Date(currentYear, currentMonth + 1, 0)
    
    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//East Coast Kink Events//Calendar//EN'
    ]
    
    monthEvents.forEach(event => {
      const eventStart = new Date(event.date.start)
      const eventEnd = new Date(event.date.end)
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${event.slug}@eastcoastkinkevents.com`,
        `DTSTART:${formatDateForICal(eventStart)}`,
        `DTEND:${formatDateForICal(eventEnd)}`,
        `SUMMARY:${event.name}`,
        `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`,
        `LOCATION:${event.location.city}, ${event.location.state}`,
        `URL:https://www.eastcoastkinkevents.com/events/${event.slug}`,
        'END:VEVENT'
      )
    })
    
    icalContent.push('END:VCALENDAR')
    
    // Create data URL for Apple Calendar integration
    const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icalContent.join('\r\n'))}`
    
    // Try to open with Apple Calendar if on macOS/iOS, otherwise download
    if (navigator.userAgent.includes('Mac') || navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      // On Apple devices, try to open with calendar app
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `east-coast-kink-events-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.ics`
      link.click()
    } else {
      // On other devices, download the file
      const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `east-coast-kink-events-${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
          BDSM &amp; kink event calendar
        </h1>
        <p className="text-base md:text-lg text-subtle max-w-3xl mx-auto px-1 leading-relaxed">
          Conferences, hotel weekends, and workshops by month—tap a date for details. Prefer a list? See{' '}
          <Link href="/events" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
            all events
          </Link>{' '}
          or{' '}
          <Link href="/states" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
            browse by state
          </Link>
          .
        </p>
      </div>

      {/* Calendar Header with Export Options */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white min-w-0 flex-1 text-center sm:flex-none sm:text-left">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button
            type="button"
            onClick={goToNextMonth}
            className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-lg bg-dark-700 hover:bg-dark-600 text-white transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={goToToday}
            className="min-h-touch px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors w-full sm:w-auto"
          >
            Today
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={exportMonthToGoogleCalendar}
            disabled={monthEvents.length === 0}
            className="group inline-flex min-h-touch items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors duration-300 shadow-lg hover:shadow-primary-500/25 md:hover:scale-105 motion-reduce:md:hover:scale-100 disabled:hover:scale-100"
            title="Add all month events to Google Calendar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            <span className="hidden sm:inline">Export Month to Google</span>
            <span className="sm:hidden">Google</span>
          </button>
          
          <button
            type="button"
            onClick={addMonthToAppleCalendar}
            disabled={monthEvents.length === 0}
            className="group inline-flex min-h-touch items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors duration-300 shadow-lg hover:shadow-gray-500/25 md:hover:scale-105 motion-reduce:md:hover:scale-100 disabled:hover:scale-100"
            title="Add all month events to Apple Calendar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.5-3.05 2.47-1.34-.03-1.74-.79-3.27-.79-1.53 0-2 .77-3.27.79-1.34.03-2.22-1.23-3.05-2.47C5.04 17.68 4 15.33 4 13c0-5.52 4.48-10 10-10s10 4.48 10 10c0 2.33-1.04 4.68-5.29 6.5z"/>
            </svg>
            <span className="hidden sm:inline">Export Month to Apple</span>
            <span className="sm:hidden">Apple</span>
          </button>
          
          <button
            type="button"
            onClick={exportMonthToICal}
            disabled={monthEvents.length === 0}
            className="group inline-flex min-h-touch items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors duration-300 shadow-lg hover:shadow-green-500/25 md:hover:scale-105 motion-reduce:md:hover:scale-100 disabled:hover:scale-100"
            title="Download all month events as iCal file"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <span className="hidden sm:inline">Export Month to iCal</span>
            <span className="sm:hidden">iCal</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid — horizontal scroll on narrow viewports */}
      <div className="card-elegant overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 touch-pan-x">
        <div className="min-w-[36rem] sm:min-w-0">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((date, index) => {
            const events = getEventsForDate(date)
            const isCurrentMonth = date.getMonth() === currentMonth
            const isPast = isPastDate(date)
            const isTodayDate = isToday(date)
            
            return (
              <div
                key={index}
                aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${events.length > 0 ? ` - ${events.length} event${events.length > 1 ? 's' : ''}` : ''}`}
                className={`min-h-[7.5rem] sm:min-h-32 p-2 border border-dark-600 ${
                  isCurrentMonth ? 'bg-dark-800' : 'bg-dark-900'
                } ${isPast ? 'opacity-50' : ''}`}
              >
                {/* Date Number */}
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-white' : 'text-gray-500'
                    } ${isTodayDate ? 'bg-primary-600 text-white px-2 py-1 rounded' : ''}`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {events.map((event, eventIndex) => {
                    const isPastEventItem = isPastEvent(event)
                    return (
                      <div key={`${event.slug}-${eventIndex}`} className="space-y-1">
                        <Link
                          href={`/events/${event.slug}`}
                          className={`block min-h-touch sm:min-h-0 py-2 sm:py-1 px-1 rounded text-xs text-white hover:opacity-80 transition-opacity ${
                            getCategoryColor(event.category, isPastEventItem)
                          } ${isPastEventItem ? 'opacity-60' : ''}`}
                          title={`${event.name} - ${event.date.display}`}
                        >
                          <div className="font-medium truncate">
                            {event.name}
                          </div>
                          <div className="text-xs opacity-90">
                            {event.location.city}, {event.location.state}
                          </div>
                        </Link>
                        
                        {/* Export buttons for each event */}
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => exportToGoogleCalendar(event)}
                            className="min-h-touch min-w-touch sm:min-h-0 sm:min-w-0 sm:h-5 sm:w-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-md text-white text-xs inline-flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-primary-500/25"
                            title={`Add ${event.name} to Google Calendar`}
                            aria-label={`Add ${event.name} to Google Calendar`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => addToAppleCalendar(event)}
                            className="min-h-touch min-w-touch sm:min-h-0 sm:min-w-0 sm:h-5 sm:w-5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-md text-white text-xs inline-flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-gray-500/25"
                            title={`Add ${event.name} to Apple Calendar`}
                            aria-label={`Add ${event.name} to Apple Calendar`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.5-3.05 2.47-1.34-.03-1.74-.79-3.27-.79-1.53 0-2 .77-3.27.79-1.34.03-2.22-1.23-3.05-2.47C5.04 17.68 4 15.33 4 13c0-5.52 4.48-10 10-10s10 4.48 10 10c0 2.33-1.04 4.68-5.29 6.5z"/>
                            </svg>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => exportToICal(event)}
                            className="min-h-touch min-w-touch sm:min-h-0 sm:min-w-0 sm:h-5 sm:w-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-md text-white text-xs inline-flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-green-500/25"
                            title={`Download ${event.name} as iCal file`}
                            aria-label={`Download ${event.name} as calendar file`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 card-elegant">
        <h3 className="text-xl font-serif font-semibold text-white mb-4">
          Event Categories
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-white text-sm sm:text-base">Outdoor Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span className="text-white text-sm sm:text-base">Indoor Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-white text-sm sm:text-base">Past Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span className="text-white text-sm sm:text-base">Today's Date</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elegant text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">
            {monthEvents.length}
          </div>
          <div className="text-white">Events This Month</div>
        </div>
        
        <div className="card-elegant text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {monthEvents.filter((e: CalendarEvent) => e.category === 'Outdoor Event').length}
          </div>
          <div className="text-white">Outdoor Events</div>
        </div>
        
        <div className="card-elegant text-center">
          <div className="text-3xl font-bold text-primary-400 mb-2">
            {monthEvents.filter((e: CalendarEvent) => e.category === 'Indoor Event').length}
          </div>
          <div className="text-white">Indoor Events</div>
        </div>
      </div>
    </div>
  )
}
