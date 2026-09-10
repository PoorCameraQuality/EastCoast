import type { Metadata } from 'next'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Groups',
  description: 'Kink community groups listed on East Coast Kink Events.',
  alternates: { canonical: `${BASE_URL}/groups` },
}

export default async function GroupsIndexPage() {
  const rows = await fetchPublishedListingsIndex('group')

  return (
    <KinkSocialListingIndexView
      title="Groups"
      description="Public group listings on East Coast Kink Events."
      indexHref="/groups"
      listings={rows}
    />
  )
}
