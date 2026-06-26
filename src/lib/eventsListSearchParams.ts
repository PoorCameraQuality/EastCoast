/**
 * Server-safe parsing / building for /events query params (intent, legacy category, location).
 */

import type { EventsListIntent } from '@/lib/publicEventIndex'

const LEGACY_CATEGORY_MAP: Record<string, EventsListIntent> = {
  'Outdoor Events': 'outdoor-events',
  'Indoor Events': 'indoor-events',
}

const VALID_INTENTS = new Set<EventsListIntent>([
  'all',
  'this-weekend',
  'conventions',
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

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

export function parseEventsListIntent(
  searchParams: Record<string, string | string[] | undefined>
): EventsListIntent {
  const rawLoc = firstParam(searchParams.location)
  if (rawLoc) return 'all'

  const rawIntent = firstParam(searchParams.intent)
  if (rawIntent && VALID_INTENTS.has(rawIntent as EventsListIntent)) {
    return rawIntent as EventsListIntent
  }

  const rawCat = firstParam(searchParams.category)
  if (rawCat) {
    const decoded = decodeURIComponent(rawCat)
    if (LEGACY_CATEGORY_MAP[decoded]) return LEGACY_CATEGORY_MAP[decoded]
  }

  return 'all'
}

/** Human label for filtered views (metadata). */
export function parseEventsListSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): string {
  const rawLoc = firstParam(searchParams.location)
  if (rawLoc) return `Location: ${decodeURIComponent(rawLoc)}`

  const intent = parseEventsListIntent(searchParams)
  const label = EVENT_INTENT_LABELS[intent]
  return intent === 'all' ? 'All Events' : label
}

const EVENT_INTENT_LABELS: Record<EventsListIntent, string> = {
  all: 'All Events',
  'this-weekend': 'This weekend',
  conventions: 'Conventions',
  classes: 'Classes',
  parties: 'Parties',
  'vendor-markets': 'Vendor markets',
  outdoor: 'Outdoor',
  'new-friendly': 'New-friendly',
  dancecard: 'Dancecard',
  'kink-social': 'From kink.social',
  'outdoor-events': 'Outdoor Events',
  'indoor-events': 'Indoor Events',
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
  const rawLoc = firstParam(searchParams.location)
  if (rawLoc) return true
  return parseEventsListIntent(searchParams) !== 'all'
}

export function buildEventsListUrl(intent: EventsListIntent, location?: string): string {
  if (location) {
    return `/events?location=${encodeURIComponent(location)}`
  }
  if (intent === 'all') return '/events'
  return `/events?intent=${encodeURIComponent(intent)}`
}

/** @deprecated use buildEventsListUrl with EventsListIntent */
export function buildEventsListUrlLegacy(selectedCategory: string): string {
  if (selectedCategory === 'All Events') return '/events'
  if (selectedCategory === 'Outdoor Events') return buildEventsListUrl('outdoor-events')
  if (selectedCategory === 'Indoor Events') return buildEventsListUrl('indoor-events')
  if (selectedCategory.startsWith('Location: ')) {
    return buildEventsListUrl('all', selectedCategory.slice('Location: '.length))
  }
  return '/events'
}
