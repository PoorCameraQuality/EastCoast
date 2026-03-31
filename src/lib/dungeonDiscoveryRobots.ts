import type { Metadata } from 'next'
import { isDungeonDiscoveryTierAllowlisted } from '@/lib/dungeonDiscoveryTier'

export function dungeonDiscoveryRobotsMeta(
  segments: string[],
  dungeonCount: number
): Metadata['robots'] {
  const tierOk = isDungeonDiscoveryTierAllowlisted(segments)
  const thin = dungeonCount < 2
  if (!tierOk || thin) {
    return { index: false, follow: true }
  }
  return { index: true, follow: true }
}
