import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KinkSocialListingDetailView from '@/components/kink-social/KinkSocialListingDetailView'
import { BASE_URL } from '@/lib/seo'
import { fetchPublishedListingBySlug } from '@/lib/unifiedExtendedListings'

export const revalidate = 1800

type PageProps = { params: { slug: string } }

function cleanDesc(raw: string | null | undefined, fallback: string): string {
  const t = (raw || fallback).replace(/\s+/g, ' ').trim()
  return t.length <= 160 ? t : `${t.slice(0, 159).trimEnd()}…`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await fetchPublishedListingBySlug('organization', params.slug)
  if (!row) return { title: 'Organization Not Found' }
  const description = cleanDesc(row.description, `${row.name} on East Coast Kink Events.`)
  const url = `${BASE_URL}/organizations/${row.slug}`
  const images = row.logoUrl
    ? [{ url: row.logoUrl.startsWith('http') ? row.logoUrl : `${BASE_URL}${row.logoUrl}`, width: 1200, height: 630, alt: row.name }]
    : [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: row.name }]
  return {
    title: row.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: row.name,
      description,
      url,
      siteName: 'East Coast Kink Events',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: row.name,
      description,
      images: images.map((i) => i.url),
    },
  }
}

export default async function OrganizationListingPage({ params }: PageProps) {
  const row = await fetchPublishedListingBySlug('organization', params.slug)
  if (!row) notFound()
  return (
    <KinkSocialListingDetailView
      entityLabel="Organization"
      indexHref="/organizations"
      indexLabel="Organizations"
      listing={row}
      analyticsEntityType="organization"
    />
  )
}
