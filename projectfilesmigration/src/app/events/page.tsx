import { Metadata } from 'next'
import EventsPageClient from './EventsPageClient'
import EventsPageSkeleton from '@/components/events/EventsPageSkeleton'
import { Suspense } from 'react'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'BDSM Events & Kink Conventions',
  description: 'Browse BDSM events and kink conventions across the East Coast. Find conferences, workshops, and fetish gatherings near you.',
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
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageClient allEvents={allEvents} allDungeons={allDungeons} />
    </Suspense>
  )
} 
