import type { Metadata } from 'next'
import { isVendorDiscoveryTierAllowlisted } from '@/lib/vendorDiscoveryTier'

export function vendorDiscoveryRobotsMeta(
  segments: string[],
  vendorCount: number
): Metadata['robots'] {
  const tierOk = isVendorDiscoveryTierAllowlisted(segments)
  const thin = vendorCount < 2
  if (!tierOk || thin) {
    return { index: false, follow: true }
  }
  return { index: true, follow: true }
}
