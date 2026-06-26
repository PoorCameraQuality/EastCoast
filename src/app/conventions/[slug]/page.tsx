import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KinkSocialListingDetailView from '@/components/kink-social/KinkSocialListingDetailView'
import { BASE_URL } from '@/lib/seo'
import { fetchPublishedListingBySlug } from '@/lib/unifiedExtendedListings'

export const revalidate = 1800

type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await fetchPublishedListingBySlug('convention', params.slug)
  if (!row) return { title: 'Convention Not Found' }
  return {
    title: row.name,
    description: row.description?.slice(0, 160) ?? `${row.name} on East Coast Kink Events.`,
    alternates: { canonical: `${BASE_URL}/conventions/${row.slug}` },
  }
}

export default async function ConventionListingPage({ params }: PageProps) {
  const row = await fetchPublishedListingBySlug('convention', params.slug)
  if (!row) notFound()
  return (
    <KinkSocialListingDetailView
      entityLabel="Convention"
      indexHref="/conventions"
      indexLabel="Conventions"
      listing={row}
    />
  )
}
