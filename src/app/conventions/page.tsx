import type { Metadata } from 'next'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Conventions',
  description: 'Kink conventions published from kink.social.',
  alternates: { canonical: `${BASE_URL}/conventions` },
}

export default async function ConventionsIndexPage() {
  const rows = await fetchPublishedListingsIndex('convention')

  return (
    <KinkSocialListingIndexView
      title="Conventions"
      description="Public convention listings synced from kink.social."
      indexHref="/conventions"
      listings={rows}
    />
  )
}
