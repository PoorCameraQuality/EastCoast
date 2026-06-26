import type { Metadata } from 'next'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Organizations',
  description: 'Kink organizations published from kink.social.',
  alternates: { canonical: `${BASE_URL}/organizations` },
}

export default async function OrganizationsIndexPage() {
  const rows = await fetchPublishedListingsIndex('organization')

  return (
    <KinkSocialListingIndexView
      title="Organizations"
      description="Public organization listings synced from kink.social."
      indexHref="/organizations"
      listings={rows}
    />
  )
}
