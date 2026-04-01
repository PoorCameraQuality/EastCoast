/**
 * Server-safe parsing / building for /events query params (category, location).
 * Keeps listing HTML crawler-visible without client useSearchParams.
 */

const VALID_CATEGORIES = new Set(['Outdoor Events', 'Indoor Events'])

export function parseEventsListSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): string {
  const rawLoc = firstParam(searchParams.location)
  const rawCat = firstParam(searchParams.category)

  if (rawLoc) {
    return `Location: ${decodeURIComponent(rawLoc)}`
  }
  if (rawCat) {
    const decoded = decodeURIComponent(rawCat)
    if (VALID_CATEGORIES.has(decoded)) {
      return decoded
    }
  }
  return 'All Events'
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined
  return Array.isArray(v) ? v[0] : v
}

/** True when URL has a recognized category or location filter (for SEO: noindex filtered views). */
export function eventsListHasActiveFilter(
  searchParams: Record<string, string | string[] | undefined>
): boolean {
  return parseEventsListSearchParams(searchParams) !== 'All Events'
}

/** Path + query for Next.js router (no trailing slash; matches trailingSlash: false). */
export function buildEventsListUrl(selectedCategory: string): string {
  if (selectedCategory === 'All Events') {
    return '/events'
  }
  if (selectedCategory === 'Outdoor Events' || selectedCategory === 'Indoor Events') {
    return `/events?category=${encodeURIComponent(selectedCategory)}`
  }
  if (selectedCategory.startsWith('Location: ')) {
    const loc = selectedCategory.slice('Location: '.length)
    return `/events?location=${encodeURIComponent(loc)}`
  }
  return '/events'
}
