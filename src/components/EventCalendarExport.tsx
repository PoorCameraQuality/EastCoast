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
  variant?: 'default' | 'eventDock'
}

export default function EventCalendarExport({ event, variant = 'default' }: EventCalendarExportProps) {
  const exportToGoogleCalendar = () => {
    const startDate = new Date(event.date.start)
    const endDate = new Date(event.date.end)
    
    // Format dates for Google Calendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`${event.name} - ${event.date.display}\nLocation: ${event.location.city}, ${event.location.state}\n\nMore info: https://www.eastcoastkinkevents.com/events/${event.slug}`)}&location=${encodeURIComponent(`${event.location.city}, ${event.location.state}`)}`
    
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

  const addToAppleCalendar = () => {
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

  if (variant === 'eventDock') {
    return (
      <div id="event-calendar" className="event-calendar-dock">
        <h2 className="event-calendar-dock-title">Add to calendar</h2>
        <p className="event-calendar-dock-note">Save dates locally or open in Google Calendar.</p>
        <div className="event-calendar-dock-actions">
          <button type="button" onClick={exportToGoogleCalendar} className="ed-btn-calendar-primary">
            Google Calendar
          </button>
          <button type="button" onClick={addToAppleCalendar} className="ed-btn-calendar-secondary">
            Apple Calendar
          </button>
          <button type="button" onClick={exportToICal} className="ed-btn-calendar-secondary">
            Download iCal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-glass p-4 sm:p-5">
      <div className="card-glass-wash" aria-hidden />
      <div className="relative z-10">
      <h2 className="font-serif text-lg font-semibold text-white">Add to calendar</h2>
      <p className="mt-2 text-sm text-gray-400">
        Save dates locally or open in Google Calendar.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={exportToGoogleCalendar}
          className="btn-primary w-full justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          Add to Google Calendar
        </button>
        
        <button
          type="button"
          onClick={addToAppleCalendar}
          className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.5-3.05 2.47-1.34-.03-1.74-.79-3.27-.79-1.53 0-2 .77-3.27.79-1.34.03-2.22-1.23-3.05-2.47C5.04 17.68 4 15.33 4 13c0-5.52 4.48-10 10-10s10 4.48 10 10c0 2.33-1.04 4.68-5.29 6.5z"/>
          </svg>
          Add to Apple Calendar
        </button>
        
        <button
          type="button"
          onClick={exportToICal}
          className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          Download iCal File
        </button>
      </div>
      </div>
    </div>
  )
}
