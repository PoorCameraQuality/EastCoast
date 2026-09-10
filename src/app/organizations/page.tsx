import type { Metadata } from 'next'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { getOrganizationCatalog } from '@/lib/eckeOrgCatalog'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Organizations',
  description: 'Kink organizations listed on East Coast Kink Events.',
  alternates: { canonical: `${BASE_URL}/organizations` },
}

export default async function OrganizationsIndexPage() {
  const rows = await getOrganizationCatalog()

  return (
    <KinkSocialListingIndexView
      title="Organizations"
      description="Public organization listings on East Coast Kink Events — dungeons, conventions, and published organizers."
      indexHref="/organizations"
      listings={rows}
    />
  )
}
