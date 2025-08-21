'use client'

interface EventCalendarExportProps {
  event: {
    slug: string
    name: string
    date: {
      start: string
      end: string
      display: string
    }
    location: {
      city: string
      state: string
    }
  }
}

export default function EventCalendarExport({ event }: EventCalendarExportProps) {
  const exportToGoogleCalendar = () => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    
    // Format dates for Google Calendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`${event.name} - ${event.date.display}\nLocation: ${event.location.city}, ${event.location.state}\n\nMore info: https://eastcoastkinkevents.com/events/${event.slug}`)}&location=${encodeURIComponent(`${event.location.city}, ${event.location.state}`)}`
    
    window.open(googleCalendarUrl, '_blank')
  }

  const exportToICal = () => {
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
      `DESCRIPTION:${event.name} - ${event.date.display}\\nLocation: ${event.location.city}, ${event.location.state}\\n\\nMore info: https://eastcoastkinkevents.com/events/${event.slug}`,
      `LOCATION:${event.location.city}, ${event.location.state}`,
      `URL:https://eastcoastkinkevents.com/events/${event.slug}`,
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

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
      <h2 className="text-xl font-serif font-bold text-white mb-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>
        Add to Calendar
      </h2>
      <p className="text-gray-300 text-sm mb-4">
        Add this event to your personal calendar or download it for offline use.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={exportToGoogleCalendar}
          className="group inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          Add to Google Calendar
        </button>
        
        <button
          onClick={exportToICal}
          className="group inline-block bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          Download iCal File
        </button>
      </div>
    </div>
  )
}
