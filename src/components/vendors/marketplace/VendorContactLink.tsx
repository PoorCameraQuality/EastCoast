import EckeLink from '@/components/EckeLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { vendorContactMailto } from '@/lib/eckeOrgVendorShared'
import { vendorOffsiteShopUrl } from '@/lib/vendorOutboundUrls'
import type { PublicVendorListing } from '@/types/publicVendorListing'

type Props = {
  vendor: PublicVendorListing
  className?: string
  label?: string
}

export default function VendorContactLink({ vendor, className, label }: Props) {
  const rawEmail = vendor.contactEmail?.trim()
  const email =
    rawEmail && !rawEmail.toLowerCase().endsWith('@eastcoastkinkevents.com') ? rawEmail : undefined
  const contactUrl = vendorOffsiteShopUrl(vendor.publicContactUrl || vendor.contactUrl)
  const buttonLabel = label || vendor.publicContactLabel?.trim() || 'Contact vendor'

  if (email) {
    return (
      <a href={vendorContactMailto(email, vendor.name)} className={className}>
        {buttonLabel}
      </a>
    )
  }

  if (contactUrl) {
    return (
      <OutboundWebsiteLink
        href={contactUrl}
        entityType="vendor"
        entitySlug={vendor.slug}
        entityName={vendor.name}
        className={className}
      >
        {buttonLabel}
      </OutboundWebsiteLink>
    )
  }

  const shopUrl = vendorOffsiteShopUrl(vendor.shopUrl, vendor.websiteUrl)
  if (shopUrl) {
    return (
      <OutboundWebsiteLink
        href={shopUrl}
        entityType="vendor"
        entitySlug={vendor.slug}
        entityName={vendor.name}
        className={className}
      >
        {label || 'Contact'}
      </OutboundWebsiteLink>
    )
  }

  return (
    <EckeLink href="/contact?subject=Vendor%20Inquiry" className={className}>
      {label || 'Contact vendor'}
    </EckeLink>
  )
}
