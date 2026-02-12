import { getAllVendors } from '@/data/vendors'
import { TAG_GROUPS, TAGS, tagGroupsById, tagsBySlug } from '@/data/vendorTaxonomy'
import VendorsPageClient from '@/components/vendors/VendorsPageClient'
import { Suspense } from 'react'

export const revalidate = 1800

export const metadata = {
  title: 'Kink Vendors & BDSM Gear',
  description: 'Discover kink vendors and BDSM gear makers. Browse impact play, bondage, fetish wear, and artisan gear across the East Coast.',
  alternates: { canonical: 'https://www.eastcoastkinkevents.com/vendors' },
}

export default function VendorsIndexPage() {
  const vendors = getAllVendors()

  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <VendorsPageClient
        vendors={vendors}
        tagGroups={TAG_GROUPS}
        tags={TAGS}
        tagsBySlug={tagsBySlug}
        tagGroupsById={tagGroupsById}
      />
    </Suspense>
  )
}

