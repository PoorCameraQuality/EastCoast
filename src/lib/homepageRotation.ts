import { isSkippedCatalogSlug } from '@/lib/eckeOrgCatalog'

/** UTC hours per homepage rail window. Stable within a request and ISR cache. */
export const HOMEPAGE_ROTATION_HOURS = 6

export const HOMEPAGE_RAIL_COUNTS = {
  vendors: 3,
  spaces: 3,
  education: 3,
  states: 8,
} as const

/** Mulberry32 — deterministic, no Math.random. Safe for SSR + hydration. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function hashStringToSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Floor UTC time into a rotating window so SSR HTML and client hydrate the same cards. */
export function homepageRotationSeed(at: Date = new Date()): number {
  const bucketMs = HOMEPAGE_ROTATION_HOURS * 60 * 60 * 1000
  return Math.floor(at.getTime() / bucketMs)
}

export function channelSeed(base: number, channel: string): number {
  return (base ^ hashStringToSeed(channel)) >>> 0
}

export function catalogItemEligible(slug: string | undefined, name: string | undefined): boolean {
  const n = (name || '').trim()
  const s = (slug || '').trim()
  if (!n || !s) return false
  return !isSkippedCatalogSlug(s)
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rand = mulberry32(seed >>> 0)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Shuffle a copy, then take `count`. Same seed + same items always yields the same slice. */
export function pickRotated<T>(items: readonly T[], count: number, seed: number): T[] {
  if (count <= 0 || items.length === 0) return []
  return seededShuffle(items, seed).slice(0, Math.min(count, items.length))
}

/**
 * Sort by slug first so catalog iteration order cannot change the pick,
 * then rotate with the seed.
 */
export function pickRotatedBySlug<T extends { slug: string }>(
  items: readonly T[],
  count: number,
  seed: number,
): T[] {
  const sorted = [...items].sort((a, b) => a.slug.localeCompare(b.slug))
  return pickRotated(sorted, count, seed)
}
