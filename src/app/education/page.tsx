import type { Metadata } from 'next'
import EducationLibraryPageClient from '@/components/education/library/EducationLibraryPageClient'
import { EducationStructuredData } from '@/components/StructuredData'
import { getPublishedEducationArticles } from '@/lib/educationArticles'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Kink Education Library — Guides, Paths & Resources',
  description:
    'Public learning library for kink education: curated paths, safety and consent guides, external resources, and educator discovery — powered by kink.social publishing.',
  alternates: {
    canonical: `${BASE_URL}/education`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${BASE_URL}/education`,
    siteName: 'East Coast Kink Events',
    title: 'Kink Education Library — Guides & Learning Paths',
    description:
      'Guides, learning paths, and curated resources for consent, safety, community, and showing up prepared.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - Education Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kink Education Library — Guides & Learning Paths',
    description:
      'Public learning library with curated paths, safety guides, and educator discovery.',
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
      <EducationLibraryPageClient initialArticles={initialArticles} />
    </>
  )
}
