import { revalidatePath } from 'next/cache'
import { dungeonDiscoveryPaths } from '@/lib/eckeDungeonDiscoveryShared'
import { submitToIndexNow } from '@/lib/indexnow'
import { BASE_URL } from '@/lib/seo'

export type DungeonDiscoveryReason = 'publish' | 'update' | 'unpublish' | 'archive' | 'delete'
export { dungeonDiscoveryPaths }

const UPDATE_DEBOUNCE_MS = 24 * 60 * 60 * 1000
const lastUpdatePingAt = new Map<string, number>()

export function dungeonDiscoveryUrls(input: {
  slug: string
  stateAbbr?: string | null
  seoHubTags?: string[]
}): string[] {
  return dungeonDiscoveryPaths(input).map((path) => `${BASE_URL}${path}`)
}

function shouldPingIndexNow(slug: string, reason: DungeonDiscoveryReason): boolean {
  if (reason !== 'update') return true
  const last = lastUpdatePingAt.get(slug) || 0
  if (Date.now() - last < UPDATE_DEBOUNCE_MS) return false
  lastUpdatePingAt.set(slug, Date.now())
  return true
}

export function notifyDungeonDiscovery(input: {
  slug: string
  stateAbbr?: string | null
  seoHubTags?: string[]
  reason: DungeonDiscoveryReason
}) {
  const paths = dungeonDiscoveryPaths(input)
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      console.error('[dungeon-discovery] revalidatePath failed', path, error)
    }
  }

  if (!shouldPingIndexNow(input.slug, input.reason)) return
  void submitToIndexNow(dungeonDiscoveryUrls(input))
}
