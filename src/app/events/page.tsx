import { Metadata } from 'next'
import { getAllEvents, getEventsByCategory } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import { EventListStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import EventsPageClient from './EventsPageClient'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'All Events - East Coast Kink Events',
  description: 'Browse all upcoming and past kink events across the East Coast. Find BDSM conferences, workshops, and community events in a safe, inclusive environment.',
  keywords: [
    'kink events',
    'BDSM events',
    'east coast',
    'fetish events',
    'lifestyle events',
    'conferences',
    'workshops',
    'community events'
  ],
  alternates: {
    canonical: 'https://www.eastcoastkinkevents.com/events',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eastcoastkinkevents.com/events',
    siteName: 'East Coast Kink Events',
    title: 'All Events - East Coast Kink Events',
    description: 'Browse all upcoming and past kink events across the East Coast. Find BDSM conferences, workshops, and community events.',
    images: [
      {
        url: 'https://www.eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - All Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Events - East Coast Kink Events',
    description: 'Browse all upcoming and past kink events across the East Coast.',
    images: ['https://www.eastcoastkinkevents.com/og-image.png'],
  },
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    }>
      <EventsPageClient />
    </Suspense>
  )
} 
