'use client'

import VendorCard from '@/components/vendors/VendorCard'
import type { VendorRecord } from '@/lib/vendorFiltering'
import { tagsBySlug } from '@/data/vendorTaxonomy'

type Props = {
  vendors: VendorRecord[]
  selectedTagSlugs: string[]
  /** GA4 `item_list_name` for marketplace hub grids */
  itemListName: string
}

export default function VendorDiscoveryHubGrid({ vendors, selectedTagSlugs, itemListName }: Props) {
  if (vendors.length === 0) {
    return (
      <p className="text-gray-400 text-center py-12">
        No vendors match this filter yet. Try the main{' '}
        <a href="/vendors" className="text-primary-400 underline underline-offset-2">
          vendors directory
        </a>{' '}
        to browse all listings.
      </p>
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 list-none p-0 m-0">
      {vendors.map((v) => (
        <li key={v.slug}>
          <VendorCard
            vendor={v}
            selectedTagSlugs={selectedTagSlugs}
            tagsBySlug={tagsBySlug}
            itemListName={itemListName}
          />
        </li>
      ))}
    </ul>
  )
}
