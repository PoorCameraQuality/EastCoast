import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KinkSocialListingDetailView from '@/components/kink-social/KinkSocialListingDetailView'
import { BASE_URL } from '@/lib/seo'
import { fetchPublishedListingBySlug } from '@/lib/unifiedExtendedListings'

export const revalidate = 60

type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await fetchPublishedListingBySlug('venue', params.slug)
  if (!row) return { title: 'Venue Not Found' }
  const description =
    row.description?.slice(0, 160) ?? `${row.name} on East Coast Kink Events.`
  const url = `${BASE_URL}/venues/${row.slug}`
  return {
    title: row.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: row.name,
      description,
      url,
      type: 'website',
      siteName: 'East Coast Kink Events',
      ...(row.logoUrl ? { images: [{ url: row.logoUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: row.name,
      description,
      ...(row.logoUrl ? { images: [row.logoUrl] } : {}),
    },
  }
}

export default async function VenueListingPage({ params }: PageProps) {
  const row = await fetchPublishedListingBySlug('venue', params.slug)
  if (!row) notFound()
  const pageUrl = `${BASE_URL}/venues/${row.slug}`
  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: row.name,
    description: row.description || undefined,
    url: pageUrl,
    image: row.logoUrl || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: row.city || undefined,
      addressRegion: row.state || undefined,
    },
    sameAs: row.kinkSocialCanonicalUrl ? [row.kinkSocialCanonicalUrl] : undefined,
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <KinkSocialListingDetailView
        entityLabel="Venue"
        indexHref="/venues"
        indexLabel="Venues"
        listing={row}
        analyticsEntityType="venue"
      />
    </>
  )
}
