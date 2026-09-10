import { revalidatePath } from 'next/cache'
import { eventDiscoveryPaths } from '@/lib/eckeEventDiscoveryShared'
import { submitToIndexNow } from '@/lib/indexnow'
import { BASE_URL } from '@/lib/seo'

export type EventDiscoveryReason = 'publish' | 'update' | 'unpublish' | 'archive' | 'delete'
export { eventDiscoveryPaths }

const UPDATE_DEBOUNCE_MS = 24 * 60 * 60 * 1000
const lastUpdatePingAt = new Map<string, number>()

export function eventDiscoveryUrls(slug: string, stateAbbr?: string | null): string[] {
  return eventDiscoveryPaths(slug, stateAbbr).map((path) => `${BASE_URL}${path}`)
}

function shouldPingIndexNow(slug: string, reason: EventDiscoveryReason): boolean {
  if (reason !== 'update') return true
  const last = lastUpdatePingAt.get(slug) || 0
  if (Date.now() - last < UPDATE_DEBOUNCE_MS) return false
  lastUpdatePingAt.set(slug, Date.now())
  return true
}

/** Refresh hub caches immediately; IndexNow only the changed URL set. */
export function notifyEventDiscovery(input: {
  slug: string
  stateAbbr?: string | null
  reason: EventDiscoveryReason
}) {
  const paths = eventDiscoveryPaths(input.slug, input.stateAbbr)
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      console.error('[event-discovery] revalidatePath failed', path, error)
    }
  }

  if (!shouldPingIndexNow(input.slug, input.reason)) return
  void submitToIndexNow(eventDiscoveryUrls(input.slug, input.stateAbbr))
}
