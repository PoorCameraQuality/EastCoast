import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import KinkSocialListingDetailView from '@/components/kink-social/KinkSocialListingDetailView'
import { getConventionCatalogBySlug } from '@/lib/eckeOrgCatalog'
import { listingCopyToPlainText } from '@/lib/eckeOrgRichText'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

type PageProps = { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const row = await getConventionCatalogBySlug(params.slug)
  if (!row) return { title: 'Convention Not Found' }
  const description = listingCopyToPlainText(row.description) || `${row.name} on East Coast Kink Events.`
  return {
    title: row.name,
    description: description.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/conventions/${row.slug}` },
  }
}

export default async function ConventionListingPage({ params }: PageProps) {
  const row = await getConventionCatalogBySlug(params.slug)
  if (!row) notFound()
  return (
    <KinkSocialListingDetailView
      entityLabel="Convention"
      indexHref="/conventions"
      indexLabel="Conventions"
      listing={row}
      analyticsEntityType="convention"
    />
  )
}
