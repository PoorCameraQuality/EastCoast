import type { Metadata } from 'next'
import StateIndexPageClient from '@/components/states/hub/StateIndexPageClient'
import { loadStateHubContext } from '@/lib/publicStateIndex'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Explore by State — Local Kink Scene Hubs',
  description:
    'Find events, conventions, venues, vendors, education, and public kink.social listings near where you live or travel. Browse local scene hubs by state.',
  alternates: {
    canonical: `${BASE_URL}/states`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${BASE_URL}/states`,
    siteName: 'East Coast Kink Events',
    title: 'Explore by State — Local Scene Hubs',
    description:
      'Local discovery hubs for kink events, places, vendors, and education across every state.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events — State Hubs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore by State — Local Scene Hubs',
    description: 'Find your local kink scene by state.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

export default async function StatesIndexPage() {
  const ctx = await loadStateHubContext()

  return (
    <StateIndexPageClient
      summaries={ctx.summaries}
      nationwideEvents={ctx.nationwideEvents}
      nationwideVendors={ctx.nationwideVendors}
      recentlyUpdated={ctx.recentlyUpdated}
    />
  )
}
