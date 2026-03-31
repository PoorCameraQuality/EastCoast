import type { Metadata } from 'next'
import { isDiscoveryTierAllowlisted } from '@/lib/discoveryTier'

export function discoveryRobotsMeta(
  segments: string[],
  eventCount: number,
  dungeonCount: number
): Metadata['robots'] {
  const tierOk = isDiscoveryTierAllowlisted(segments)
  const thin = eventCount + dungeonCount < 2
  if (!tierOk || thin) {
    return { index: false, follow: true }
  }
  return { index: true, follow: true }
}
