import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { isCitySlug } from '@/lib/discoveryCityRegistry'
import { isDungeonHubTagSlug, type DungeonSeoHubTagSlug } from '@/lib/dungeonHubTagMap'
import type { DungeonHubFilter } from '@/lib/unifiedDungeons'

export type ParsedDungeonDiscovery =
  | { kind: 'dungeonDetail'; slug: string }
  | { kind: 'hub'; variant: 'state'; stateSlug: StateSlug }
  | { kind: 'hub'; variant: 'city'; citySlug: string }
  | { kind: 'hub'; variant: 'tag'; tagSlug: DungeonSeoHubTagSlug }
  | { kind: 'hub'; variant: 'stateTag'; stateSlug: StateSlug; tagSlug: DungeonSeoHubTagSlug }
  | { kind: 'hub'; variant: 'cityTag'; citySlug: string; tagSlug: DungeonSeoHubTagSlug }

/**
 * Single segment: state → city → dungeon hub tag → dungeon detail slug.
 * Two segments: (state|city) + dungeon hub tag only.
 */
export function parseDungeonDiscoverySlug(segments: string[]): ParsedDungeonDiscovery | null {
  if (segments.length === 0 || segments.length > 2) return null

  const [a, b] = segments

  if (segments.length === 1) {
    if (a in EAST_COAST_STATES) {
      return { kind: 'hub', variant: 'state', stateSlug: a as StateSlug }
    }
    if (isCitySlug(a)) {
      return { kind: 'hub', variant: 'city', citySlug: a }
    }
    if (isDungeonHubTagSlug(a)) {
      return { kind: 'hub', variant: 'tag', tagSlug: a }
    }
    // C2K-published / DB-only venues are not in static dungeons.js — accept any
    // remaining single segment as a detail slug (parity with vendor discovery).
    return { kind: 'dungeonDetail', slug: a }
  }

  if (b && isDungeonHubTagSlug(b)) {
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

export function parseDungeonDiscoverySlugSafe(
  segments: string[] | undefined
): ParsedDungeonDiscovery | null {
  if (!segments?.length) return null
  return parseDungeonDiscoverySlug(segments)
}

export function dungeonHubFilterFromParsed(
  parsed: Extract<ParsedDungeonDiscovery, { kind: 'hub' }>
): DungeonHubFilter {
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
