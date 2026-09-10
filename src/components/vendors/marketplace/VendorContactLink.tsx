import EckeLink from '@/components/EckeLink'
import { vendorContactMailto } from '@/lib/eckeOrgVendorShared'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
  className?: string
  label?: string
}

export default function VendorContactLink({ vendor, className, label = 'Contact vendor' }: Props) {
  const email = vendor.contactEmail?.trim()
  if (email) {
    return (
      <a href={vendorContactMailto(email, vendor.name)} className={className}>
        {label}
      </a>
    )
  }
  return (
    <EckeLink href="/contact?subject=Vendor%20Inquiry" className={className}>
      {label}
    </EckeLink>
  )
}
