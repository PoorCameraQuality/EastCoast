import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import { Metadata } from 'next'
import { CalendarStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import CalendarClient from '@/components/CalendarClient'

const BASE = 'https://www.eastcoastkinkevents.com'

export async function generateMetadata(): Promise<Metadata> {
  const year = new Date().getFullYear()
  const title = `BDSM & Kink Event Calendar ${year} (By Month)`
  const description = `Kink & BDSM event calendar ${year}: browse conferences, hotel weekends, and workshops by month. Plan travel—East Coast focus, national listings.`
  return {
    title,
    description: description.slice(0, 160),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: `${BASE}/calendar`,
    },
    openGraph: {
      title,
      description: description.slice(0, 200),
      type: 'website',
      url: `${BASE}/calendar`,
      images: [
        {
          url: `${BASE}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'East Coast Kink Events Calendar',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 200),
      images: [`${BASE}/og-image.png`],
    },
  }
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
      <div className="container-custom section-padding">
        <Breadcrumb items={breadcrumbItems} />
        <CalendarClient allEvents={eventsList} />
        <SupportCTAInline contextLabel="Calendar" />
      </div>
    </main>
  )
}
