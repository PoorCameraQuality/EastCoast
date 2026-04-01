import { getSwingClubBySlug } from '@/data/swingClubs'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { isCitySlug } from '@/lib/discoveryCityRegistry'
import { isSwingHubTagSlug, type SwingSeoHubTagSlug } from '@/lib/swingHubTagMap'
import type { SwingHubFilter } from '@/lib/unifiedSwingClubs'

export type ParsedSwingDiscovery =
  | { kind: 'swingDetail'; slug: string }
  | { kind: 'hub'; variant: 'state'; stateSlug: StateSlug }
  | { kind: 'hub'; variant: 'city'; citySlug: string }
  | { kind: 'hub'; variant: 'tag'; tagSlug: SwingSeoHubTagSlug }
  | { kind: 'hub'; variant: 'stateTag'; stateSlug: StateSlug; tagSlug: SwingSeoHubTagSlug }
  | { kind: 'hub'; variant: 'cityTag'; citySlug: string; tagSlug: SwingSeoHubTagSlug }

export function parseSwingDiscoverySlug(segments: string[]): ParsedSwingDiscovery | null {
  if (segments.length === 0 || segments.length > 2) return null

  const [a, b] = segments

  if (segments.length === 1) {
    if (a in EAST_COAST_STATES) {
      return { kind: 'hub', variant: 'state', stateSlug: a as StateSlug }
    }
    if (isCitySlug(a)) {
      return { kind: 'hub', variant: 'city', citySlug: a }
    }
    if (isSwingHubTagSlug(a)) {
      return { kind: 'hub', variant: 'tag', tagSlug: a }
    }
    if (getSwingClubBySlug(a)) {
      return { kind: 'swingDetail', slug: a }
    }
    return null
  }

  if (b && isSwingHubTagSlug(b)) {
    if (a in EAST_COAST_STATES) {
      return {
        kind: 'hub',
        variant: 'stateTag',
        stateSlug: a as StateSlug,
        tagSlug: b,
      }
    }
    if (isCitySlug(a)) {
      return { kind: 'hub', variant: 'cityTag', citySlug: a, tagSlug: b }
    }
  }

  return null
}

export function parseSwingDiscoverySlugSafe(
  segments: string[] | undefined
): ParsedSwingDiscovery | null {
  if (!segments?.length) return null
  return parseSwingDiscoverySlug(segments)
}

export function swingHubFilterFromParsed(
  parsed: Extract<ParsedSwingDiscovery, { kind: 'hub' }>
): SwingHubFilter {
  switch (parsed.variant) {
    case 'state':
      return { stateSlug: parsed.stateSlug }
    case 'city':
      return { citySlug: parsed.citySlug }
    case 'tag':
      return { tagSlug: parsed.tagSlug }
    case 'stateTag':
      return { stateSlug: parsed.stateSlug, tagSlug: parsed.tagSlug }
    case 'cityTag':
      return { citySlug: parsed.citySlug, tagSlug: parsed.tagSlug }
  }
}
