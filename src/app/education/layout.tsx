import { Metadata } from 'next'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Education | East Coast Kink Events',
  description: 'Educational articles and resources about kink, BDSM, and the community.',
  keywords: ['education', 'kink', 'BDSM', 'articles', 'resources', 'community'],
  openGraph: {
    title: 'Education | East Coast Kink Events',
    description: 'Educational articles and resources about kink, BDSM, and the community.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/education',
    siteName: 'East Coast Kink Events',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Education - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Education | East Coast Kink Events',
    description: 'Educational articles and resources about kink, BDSM, and the community.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
  alternates: {
    canonical: `${BASE_URL}/education`,
  },
}

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
