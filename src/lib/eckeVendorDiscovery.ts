import { revalidatePath } from 'next/cache'
import { vendorDiscoveryPaths } from '@/lib/eckeVendorDiscoveryShared'
import { submitToIndexNow } from '@/lib/indexnow'
import { BASE_URL } from '@/lib/seo'

export type VendorDiscoveryReason = 'publish' | 'update' | 'unpublish' | 'archive' | 'delete'
export { vendorDiscoveryPaths }

const UPDATE_DEBOUNCE_MS = 24 * 60 * 60 * 1000
const lastUpdatePingAt = new Map<string, number>()

export function vendorDiscoveryUrls(input: {
  slug: string
  stateAbbr?: string | null
  seoHubTags?: string[]
  onlineOnly?: boolean
}): string[] {
  return vendorDiscoveryPaths(input).map((path) => `${BASE_URL}${path}`)
}

function shouldPingIndexNow(slug: string, reason: VendorDiscoveryReason): boolean {
  if (reason !== 'update') return true
  const last = lastUpdatePingAt.get(slug) || 0
  if (Date.now() - last < UPDATE_DEBOUNCE_MS) return false
  lastUpdatePingAt.set(slug, Date.now())
  return true
}

export function notifyVendorDiscovery(input: {
  slug: string
  stateAbbr?: string | null
  seoHubTags?: string[]
  onlineOnly?: boolean
  reason: VendorDiscoveryReason
}) {
  const paths = vendorDiscoveryPaths(input)
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      console.error('[vendor-discovery] revalidatePath failed', path, error)
    }
  }

  if (!shouldPingIndexNow(input.slug, input.reason)) return
  void submitToIndexNow(vendorDiscoveryUrls(input))
}
