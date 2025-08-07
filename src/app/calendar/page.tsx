import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import { Metadata } from 'next'
import { CalendarStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import CalendarClient from '@/components/CalendarClient'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Event Calendar - East Coast Kink Events',
  description: 'Browse upcoming kink events by month with our interactive calendar. Find BDSM events, conferences, and workshops across the East Coast.',
  keywords: 'kink event calendar, BDSM events, east coast calendar, monthly events, kink conferences, workshops',
  openGraph: {
    title: 'Event Calendar - East Coast Kink Events',
    description: 'Browse upcoming kink events by month with our interactive calendar. Find BDSM events, conferences, and workshops across the East Coast.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/calendar',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events Calendar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Calendar - East Coast Kink Events',
    description: 'Browse upcoming kink events by month with our interactive calendar.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function CalendarPage() {
  const allEvents = getAllEvents()
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Calendar', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <CalendarStructuredData />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <CalendarClient allEvents={allEvents} />
      </div>
    </div>
  )
}
