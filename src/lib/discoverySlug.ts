import { notFound } from 'next/navigation'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG, isCitySlug, cityMatchesPhiladelphiaCluster } from '@/lib/discoveryCityRegistry'
import { isLikelyTagSlug } from '@/lib/discoveryTags'

export { CITY_BY_SLUG, cityMatchesPhiladelphiaCluster }

export type DiscoveryParsed =
  | { kind: 'state'; stateSlug: StateSlug }
  | { kind: 'city'; citySlug: string }
  | { kind: 'stateTag'; stateSlug: StateSlug; tagSlug: string }
  | { kind: 'cityTag'; citySlug: string; tagSlug: string }
  | { kind: 'special'; special: 'weekend' | 'near_philadelphia' }

/** Same as parseDiscoverySlug but returns null instead of notFound (for metadata). */
export function parseDiscoverySlugSafe(segments: string[] | undefined): DiscoveryParsed | null {
  try {
    if (!segments?.length) return null
    if (segments[0] === 'this-weekend') {
      if (segments.length > 1) return null
      return { kind: 'special', special: 'weekend' }
    }
    if (segments[0] === 'near-philadelphia') {
      if (segments.length > 1) return null
      return { kind: 'special', special: 'near_philadelphia' }
    }
    if (segments.length === 1) {
      const seg = segments[0]
      if (isCitySlug(seg)) return { kind: 'city', citySlug: seg }
      if (seg in EAST_COAST_STATES) return { kind: 'state', stateSlug: seg as StateSlug }
      return null
    }
    if (segments.length === 2) {
      const a = segments[0]
      const b = segments[1]
      if (!b || !isLikelyTagSlug(b)) return null
      if (a in EAST_COAST_STATES) return { kind: 'stateTag', stateSlug: a as StateSlug, tagSlug: b }
      if (isCitySlug(a)) return { kind: 'cityTag', citySlug: a, tagSlug: b }
      return null
    }
    return null
  } catch {
    return null
  }
}

export function parseDiscoverySlug(segments: string[] | undefined): DiscoveryParsed {
  if (!segments?.length) notFound()

  if (segments[0] === 'this-weekend') {
    if (segments.length > 1) notFound()
    return { kind: 'special', special: 'weekend' }
  }
  if (segments[0] === 'near-philadelphia') {
    if (segments.length > 1) notFound()
    return { kind: 'special', special: 'near_philadelphia' }
  }

  if (segments.length === 1) {
    const seg = segments[0]
    if (isCitySlug(seg)) {
      return { kind: 'city', citySlug: seg }
    }
    if (seg in EAST_COAST_STATES) {
      return { kind: 'state', stateSlug: seg as StateSlug }
    }
    notFound()
  }

  if (segments.length === 2) {
    const a = segments[0]
    const b = segments[1]
    if (!b || !isLikelyTagSlug(b)) notFound()

    if (a in EAST_COAST_STATES) {
      return { kind: 'stateTag', stateSlug: a as StateSlug, tagSlug: b }
    }
    if (isCitySlug(a)) {
      return { kind: 'cityTag', citySlug: a, tagSlug: b }
    }
    notFound()
  }

  notFound()
}

export function stateAbbrFromSlug(stateSlug: StateSlug): string {
  return EAST_COAST_STATES[stateSlug].abbr
}
