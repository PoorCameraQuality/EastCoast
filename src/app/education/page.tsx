import type { Metadata } from 'next'
import EducationPageClient from './EducationPageClient'
import { EducationStructuredData } from '@/components/StructuredData'
import { getPublishedEducationArticles } from '@/lib/educationArticles'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'BDSM Education Hub: Articles & Curated Kink Guides',
  description:
    'BDSM education hub with East Coast Kink Events articles plus curated links to trusted guides on consent, safety, aftercare, community, and more.',
  alternates: {
    canonical: `${BASE_URL}/education`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${BASE_URL}/education`,
    siteName: 'East Coast Kink Events',
    title: 'BDSM Education — Consent, Safety & Kink Guides',
    description:
      'Our BDSM education articles plus curated off-site guides on consent, safety, negotiation, aftercare, and community norms.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - Educational Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDSM Education — Consent, Safety & Kink Guides',
    description:
      'Free adult BDSM education articles on consent, safety, negotiation, aftercare, kink terms, and community norms.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

export default async function EducationPage() {
  const initialArticles = await getPublishedEducationArticles()
  const articlesForSchema = initialArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    author_name: a.author_name,
  }))

  return (
    <>
      <EducationStructuredData articles={articlesForSchema} />
      <EducationPageClient initialArticles={initialArticles} />
    </>
  )
}
