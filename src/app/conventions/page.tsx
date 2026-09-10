import type { Metadata } from 'next'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { getConventionCatalog } from '@/lib/eckeOrgCatalog'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Conventions',
  description: 'Kink conventions listed on East Coast Kink Events.',
  alternates: { canonical: `${BASE_URL}/conventions` },
}

export default async function ConventionsIndexPage() {
  const rows = await getConventionCatalog()

  return (
    <KinkSocialListingIndexView
      title="Conventions"
      description="National multi-day kink conventions and hotel weekends listed on East Coast Kink Events."
      indexHref="/conventions"
      listings={rows}
    />
  )
}
