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
    const currentDate = new Date(startDate)

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
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
    const dateStr = date.toISOString().split('T')[0]
    
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

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get category color
  const getCategoryColor = (category: string, isPast: boolean) => {
    if (isPast) {
      return 'bg-gray-500' // Grey for past events
    }
    
    switch (category) {
      case 'Outdoor Event':
        return 'bg-green-600'
      case 'Indoor Event':
        return 'bg-blue-600'
      default:
        return 'bg-primary-600'
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">
          Event Calendar
        </h1>
        <p className="text-lg text-subtle max-w-3xl mx-auto">
          Browse upcoming kink events by month. Click on any date to see event details.
        </p>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={goToPreviousMonth}
          className="btn-outline px-6 py-3 text-white hover:bg-primary-600 hover:border-primary-600 transition-colors"
        >
          ← Previous Month
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-serif font-semibold text-white mb-2">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToToday}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            Go to Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="btn-outline px-6 py-3 text-white hover:bg-primary-600 hover:border-primary-600 transition-colors"
        >
          Next Month →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="card-elegant">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center">
              <span className="text-white font-medium text-sm">{day}</span>
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
                className={`min-h-32 p-2 border border-dark-600 ${
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
                      <Link
                        key={`${event.slug}-${eventIndex}`}
                        href={`/events/${event.slug}`}
                        className={`block p-1 rounded text-xs text-white hover:opacity-80 transition-opacity ${
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
                    )
                  })}
                </div>
              </div>
            )
          })}
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
            <span className="text-white">Outdoor Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-white">Indoor Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-white">Past Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span className="text-white">Today's Date</span>
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
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {monthEvents.filter((e: CalendarEvent) => e.category === 'Indoor Event').length}
          </div>
          <div className="text-white">Indoor Events</div>
        </div>
      </div>
    </div>
  )
}
