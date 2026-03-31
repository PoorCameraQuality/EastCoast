import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { isVendorSeoHubTagSlug, type VendorSeoHubTagSlug } from '@/lib/vendorHubTagMap'

export type ParsedVendorDiscovery =
  | { kind: 'vendorDetail'; slug: string }
  | { kind: 'hub'; variant: 'online' }
  | { kind: 'hub'; variant: 'state'; stateSlug: StateSlug }
  | { kind: 'hub'; variant: 'tag'; seoTagSlug: VendorSeoHubTagSlug }
  | {
      kind: 'hub'
      variant: 'stateTag'
      stateSlug: StateSlug
      seoTagSlug: VendorSeoHubTagSlug
    }

/**
 * Single-segment order: `online` → state slug → SEO hub tag → vendor slug.
 * Two segments: `/vendors/{state}/{seoTag}` only.
 */
export function parseVendorDiscoverySlug(segments: string[]): ParsedVendorDiscovery | null {
  if (segments.length === 0 || segments.length > 2) return null

  const [a, b] = segments

  if (segments.length === 1) {
    if (a === 'online') {
      return { kind: 'hub', variant: 'online' }
    }
    if (a in EAST_COAST_STATES) {
      return { kind: 'hub', variant: 'state', stateSlug: a as StateSlug }
    }
    if (isVendorSeoHubTagSlug(a)) {
      return { kind: 'hub', variant: 'tag', seoTagSlug: a }
    }
    // Vendor detail (static or Supabase) — resolved at runtime via resolveVendorBySlug
    return { kind: 'vendorDetail', slug: a }
  }

  if (b && a in EAST_COAST_STATES && isVendorSeoHubTagSlug(b)) {
    return {
      kind: 'hub',
      variant: 'stateTag',
      stateSlug: a as StateSlug,
      seoTagSlug: b,
    }
  }

  return null
}

/** Safe parse for metadata: never throws; returns null if URL is not a valid hub or vendor. */
export function parseVendorDiscoverySlugSafe(segments: string[] | undefined): ParsedVendorDiscovery | null {
  if (!segments?.length) return null
  return parseVendorDiscoverySlug(segments)
}
