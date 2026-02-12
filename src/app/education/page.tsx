import type { Metadata } from 'next'
import EducationPageClient from './EducationPageClient'
import { EducationStructuredData } from '@/components/StructuredData'
import { BASE_URL } from '@/lib/seo'
import { supabase } from '@/lib/supabase'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'BDSM Education & Guides',
  description: 'Browse expert BDSM guides, kink safety tips, and consent education. Learn before you play—free articles from East Coast Kink Events.',
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
    canonical: `${BASE_URL}/education`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eastcoastkinkevents.com/education',
    siteName: 'East Coast Kink Events',
    title: 'BDSM Education & Guides',
    description: 'Access comprehensive educational resources about BDSM, kink safety, consent, and community building.',
    images: [
      {
        url: 'https://www.eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - Educational Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDSM Education & Guides',
    description: 'Access comprehensive educational resources about BDSM, kink safety, consent, and community building.',
    images: ['https://www.eastcoastkinkevents.com/og-image.png'],
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
    author_name: a.author_name
  }))
  return (
    <>
      <EducationStructuredData articles={articlesForSchema} />
      <EducationPageClient initialArticles={initialArticles} />
    </>
  )
}

