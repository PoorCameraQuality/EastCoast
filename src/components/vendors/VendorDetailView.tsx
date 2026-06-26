import { VendorStructuredData } from '@/components/StructuredData'
import VendorStorefrontDetail from '@/components/vendors/marketplace/VendorStorefrontDetail'
import { tagsBySlug } from '@/data/vendorTaxonomy'
import { attachVendorEvents, vendorToListing } from '@/lib/publicVendorIndex'
import { getVendorPaidImage125Url } from '@/lib/vendorFiltering'
import { getUnifiedEvents } from '@/lib/unifiedEvents'
import { parseVendorLocation, type UnifiedVendor } from '@/lib/unifiedVendors'
import type { VendorRecord } from '@/lib/vendorFiltering'

type Props = {
  vendor: VendorRecord
  selectedTagSlugs: string[]
}

export default async function VendorDetailView({ vendor, selectedTagSlugs }: Props) {
  const unified = vendor as UnifiedVendor
  let listing = vendorToListing(unified, tagsBySlug)
  const paidImg = getVendorPaidImage125Url({ vendor, selectedTagSlugs: selectedTagSlugs.length ? selectedTagSlugs : vendor.tagSlugs })
  if (paidImg) {
    listing = { ...listing, coverImageUrl: paidImg }
  }
  const unifiedEvents = await getUnifiedEvents()
  const withEvents = attachVendorEvents([listing], unifiedEvents)[0]!
  const { stateAbbr } = parseVendorLocation(vendor.location)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Vendors & makers', href: '/vendors' },
    { label: vendor.name, href: `/vendors/${vendor.slug}`, current: true },
  ]

  return (
    <VendorStorefrontDetail
      vendor={withEvents}
      breadcrumbItems={breadcrumbItems}
      structuredData={<VendorStructuredData vendor={vendor} />}
      stateAbbr={stateAbbr ?? undefined}
    />
  )
}
