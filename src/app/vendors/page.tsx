import { getAllVendors } from '@/data/vendors'
import { TAG_GROUPS, TAGS, tagGroupsById, tagsBySlug } from '@/data/vendorTaxonomy'
import VendorsPageClient from '@/components/vendors/VendorsPageClient'
import { Suspense } from 'react'

export const metadata = {
  title: 'Vendors',
  description:
    'Browse vendors across categories like impact, bondage, clothing, and more.',
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

