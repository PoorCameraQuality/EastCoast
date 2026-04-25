import type { Metadata } from 'next'
import EducationPageClient from './EducationPageClient'
import { EducationStructuredData } from '@/components/StructuredData'
import { BASE_URL } from '@/lib/seo'
import { supabase } from '@/lib/supabase'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'BDSM Education: Consent, Safety & Kink Guides',
  description:
    'Free BDSM education guides for adults: consent, safety, negotiation, aftercare, kink terms, and technique basics before events or play.',
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
      'Browse adult BDSM education articles on consent, safety, negotiation, aftercare, kink terms, and community norms.',
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

async function getArticles() {
  const client = supabase
  if (!client) return []
  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }
  return data || []
}

export default async function EducationPage() {
  const initialArticles = await getArticles()
  const articlesForSchema = initialArticles.map((a: any) => ({
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

