/**
 * Programmatic surfaces default to **full North American** hub coverage (US + Canadian provinces/territories).
 *
 * Set `NEXT_PUBLIC_DISCOVERY_LIMITED=true` to restore staged rollout: then use
 * `NEXT_PUBLIC_DISCOVERY_FULL_INDEX=true` or per-vertical flags
 * (`NEXT_PUBLIC_VENDOR_DISCOVERY_FULL_INDEX`, `NEXT_PUBLIC_DUNGEON_DISCOVERY_FULL_INDEX`,
 * `NEXT_PUBLIC_BLOG_PROGRAMMATIC_FULL_INDEX`) to expand beyond tier-1 paths.
 */

export function isDiscoveryFullIndexUnlocked(legacyPerVerticalFullIndex: boolean): boolean {
  if (process.env.NEXT_PUBLIC_DISCOVERY_LIMITED === 'true') {
    if (process.env.NEXT_PUBLIC_DISCOVERY_FULL_INDEX === 'true') return true
    return legacyPerVerticalFullIndex
  }
  return true
}
