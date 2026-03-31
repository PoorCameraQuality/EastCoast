/**
 * Rollout: set `NEXT_PUBLIC_DISCOVERY_FULL_INDEX=true` to unlock full indexing on **all**
 * programmatic discovery surfaces (bdsm-events, vendors, dungeons, blog geo pages).
 *
 * Per-vertical flags remain supported when the unified flag is unset so existing deploys keep working:
 * - NEXT_PUBLIC_VENDOR_DISCOVERY_FULL_INDEX
 * - NEXT_PUBLIC_DUNGEON_DISCOVERY_FULL_INDEX
 * - NEXT_PUBLIC_BLOG_PROGRAMMATIC_FULL_INDEX
 */

export function isDiscoveryFullIndexUnlocked(legacyPerVerticalFullIndex: boolean): boolean {
  if (process.env.NEXT_PUBLIC_DISCOVERY_FULL_INDEX === 'true') return true
  return legacyPerVerticalFullIndex
}
