import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import { Metadata } from 'next'
import { CalendarStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import CalendarClient from '@/components/CalendarClient'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Kink Event Calendar 2026',
  description: '2026 kink event calendar. Browse BDSM conferences, workshops, and fetish events by month. Plan your next East Coast kink gathering.',
  keywords: 'kink event calendar, BDSM events, east coast calendar, monthly events, kink conferences, workshops',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://www.eastcoastkinkevents.com/calendar',
  },
  openGraph: {
    title: 'Kink Event Calendar 2026',
    description: 'Browse upcoming kink events by month with our interactive calendar. Find BDSM events, conferences, and workshops across the East Coast.',
    type: 'website',
    url: 'https://www.eastcoastkinkevents.com/calendar',
    images: [
      {
        url: 'https://www.eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events Calendar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kink Event Calendar 2026',
    description: 'Browse upcoming kink events by month with our interactive calendar.',
    images: ['https://www.eastcoastkinkevents.com/og-image.png'],
  },
}

export default function CalendarPage() {
  const eventsList = getAllEvents()
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Calendar', href: '/calendar', current: true }
  ]

  return (
    <main className="min-h-screen bg-black">
      <CalendarStructuredData />
      <div className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />
        <SupportCTAInline contextLabel="Calendar" />
        <CalendarClient allEvents={eventsList} />
      </div>
    </main>
  )
}
