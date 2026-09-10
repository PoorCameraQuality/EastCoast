/**
 * Server-safe parsing / building for /events query params (intent, legacy category, location).
 */

import type { EventsListIntent } from '@/lib/publicEventIndex'
import { EVENT_INTENT_OPTIONS } from '@/lib/publicEventIndex'

const LEGACY_CATEGORY_MAP: Record<string, EventsListIntent> = {
  'Outdoor Events': 'outdoor-events',
  'Indoor Events': 'indoor-events',
}

const VALID_INTENTS = new Set<EventsListIntent>([
  'all',
  'this-weekend',
  'conventions',
  'local',
  'classes',
  'parties',
  'vendor-markets',
  'outdoor',
  'new-friendly',
  'dancecard',
  'kink-social',
  'outdoor-events',
  'indoor-events',
])

const DEFAULT_INTENT: EventsListIntent = 'conventions'

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

export function parseEventsListIntent(
  searchParams: Record<string, string | string[] | undefined>
): EventsListIntent {
  const rawIntent = firstParam(searchParams.intent)
  if (rawIntent === 'all') return DEFAULT_INTENT
  if (rawIntent && VALID_INTENTS.has(rawIntent as EventsListIntent)) {
    return rawIntent as EventsListIntent
  }

  const rawCat = firstParam(searchParams.category)
  if (rawCat) {
    const decoded = decodeURIComponent(rawCat)
    if (LEGACY_CATEGORY_MAP[decoded]) return LEGACY_CATEGORY_MAP[decoded]
  }

  return DEFAULT_INTENT
}

/** Human label for filtered views (metadata). */
export function parseEventsListSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): string {
  const rawLoc = firstParam(searchParams.location)
  const intent = parseEventsListIntent(searchParams)
  const intentLabel = EVENT_INTENT_OPTIONS.find((option) => option.id === intent)?.label
    ?? (intent === 'all' ? 'All Events' : intent)
  if (rawLoc) return `${intentLabel}: ${decodeURIComponent(rawLoc)}`
  return intent === DEFAULT_INTENT ? 'Conventions' : intentLabel
}

export function parseEventsListLocation(
  searchParams: Record<string, string | string[] | undefined>
): string | undefined {
  const rawLoc = firstParam(searchParams.location)
  return rawLoc ? decodeURIComponent(rawLoc) : undefined
}

export function eventsListHasActiveFilter(
  searchParams: Record<string, string | string[] | undefined>
): boolean {
  return Boolean(
    firstParam(searchParams.intent) ||
      firstParam(searchParams.category) ||
      firstParam(searchParams.location)
  )
}

export function buildEventsListUrl(intent: EventsListIntent, location?: string): string {
  const params = new URLSearchParams()
  if (intent && intent !== DEFAULT_INTENT && intent !== 'all') params.set('intent', intent)
  if (location) params.set('location', location)
  const query = params.toString()
  return query ? `/events?${query}` : '/events'
}

/** @deprecated use buildEventsListUrl with EventsListIntent */
export function buildEventsListUrlLegacy(selectedCategory: string): string {
  if (selectedCategory === 'All Events') return buildEventsListUrl('all')
  if (selectedCategory === 'Outdoor Events') return buildEventsListUrl('outdoor-events')
  if (selectedCategory === 'Indoor Events') return buildEventsListUrl('indoor-events')
  if (selectedCategory.startsWith('Location: ')) {
    return buildEventsListUrl('local', selectedCategory.slice('Location: '.length))
  }
  return '/events'
}
