import type { Metadata } from 'next'
import EducationPageClient from './EducationPageClient'

export const metadata: Metadata = {
  title: 'Educational Resources - East Coast Kink Events',
  description: 'Access comprehensive educational resources about BDSM, kink safety, consent, and community building. Expert articles and guides for the kink community.',
  keywords: [
    'BDSM education',
    'kink safety',
    'consent education',
    'BDSM techniques',
    'kink community resources',
    'lifestyle education',
    'safe practices',
    'community building'
  ],
  alternates: {
    canonical: 'https://eastcoastkinkevents.com/education',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eastcoastkinkevents.com/education',
    siteName: 'East Coast Kink Events',
    title: 'Educational Resources - East Coast Kink Events',
    description: 'Access comprehensive educational resources about BDSM, kink safety, consent, and community building.',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - Educational Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Educational Resources - East Coast Kink Events',
    description: 'Access comprehensive educational resources about BDSM, kink safety, consent, and community building.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function EducationPage() {
  return <EducationPageClient />
}

