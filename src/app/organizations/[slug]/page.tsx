import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KinkSocialListingDetailView from '@/components/kink-social/KinkSocialListingDetailView'
import { BASE_URL } from '@/lib/seo'
import { fetchPublishedListingBySlug } from '@/lib/unifiedExtendedListings'

export const revalidate = 1800

type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await fetchPublishedListingBySlug('organization', params.slug)
  if (!row) return { title: 'Organization Not Found' }
  return {
    title: row.name,
    description: row.description?.slice(0, 160) ?? `${row.name} on East Coast Kink Events.`,
    alternates: { canonical: `${BASE_URL}/organizations/${row.slug}` },
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
    />
  )
}
