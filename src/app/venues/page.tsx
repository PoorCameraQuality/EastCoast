import type { Metadata } from 'next'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import KinkSocialListingIndexView from '@/components/kink-social/KinkSocialListingIndexView'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Venues',
  description: 'Kink venues and play spaces published from kink.social.',
  alternates: { canonical: `${BASE_URL}/venues` },
}

export default async function VenuesIndexPage() {
  const rows = await fetchPublishedListingsIndex('venue')

  return (
    <KinkSocialListingIndexView
      title="Venues"
      description="Public venue listings synced from kink.social."
      indexHref="/venues"
      listings={rows}
    />
  )
}
