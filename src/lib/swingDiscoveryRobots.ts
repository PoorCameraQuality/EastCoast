import type { Metadata } from 'next'
import { isSwingDiscoveryTierAllowlisted } from '@/lib/swingDiscoveryTier'

export function swingDiscoveryRobotsMeta(
  segments: string[],
  swingCount: number
): Metadata['robots'] {
  const tierOk = isSwingDiscoveryTierAllowlisted(segments)
  const thin = swingCount < 2
  if (!tierOk || thin) {
    return { index: false, follow: true }
  }
  return { index: true, follow: true }
}
