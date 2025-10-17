import { Metadata } from 'next'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import Link from 'next/link'
import DungeonLogo from '@/components/DungeonLogo'
import Breadcrumb from '@/components/Breadcrumb'
import Search from '@/components/Search'
import DungeonsPageClient from './DungeonsPageClient'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'BDSM Dungeons - East Coast Kink Events',
  description: 'Discover BDSM dungeons and kink spaces across the East Coast. Find private sessions, workshops, and community events in safe, inclusive environments.',
  keywords: [
    'BDSM dungeons',
    'kink spaces',
    'east coast',
    'private sessions',
    'workshops',
    'community events',
    'safe spaces',
    'inclusive environments'
  ],
  alternates: {
    canonical: `${BASE_URL}/dungeons`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eastcoastkinkevents.com/dungeons',
    siteName: 'East Coast Kink Events',
    title: 'BDSM Dungeons - East Coast Kink Events',
    description: 'Discover BDSM dungeons and kink spaces across the East Coast. Find private sessions, workshops, and community events.',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - BDSM Dungeons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDSM Dungeons - East Coast Kink Events',
    description: 'Discover BDSM dungeons and kink spaces across the East Coast.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function DungeonsPage() {
  return <DungeonsPageClient />
}
