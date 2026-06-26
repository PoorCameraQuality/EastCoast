import type { Metadata } from 'next'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Presenters',
  description: 'Kink presenters published from kink.social.',
  alternates: { canonical: `${BASE_URL}/presenters` },
}

export default async function PresentersIndexPage() {
  const rows = await fetchPublishedListingsIndex('presenter')

  return (
    <KinkSocialListingIndexView
      title="Presenters"
      description="Public presenter profiles synced from kink.social."
      indexHref="/presenters"
      listings={rows}
    />
  )
}
