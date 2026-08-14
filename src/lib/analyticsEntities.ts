/**
 * GA4 helpers for listing clicks (select_item), detail page views (view_item + enriched page_view),
 * and outbound entity CTAs.
 * Fires only when gtag is loaded and `window.gaConsent` is true (set on load with GA).
 */

export type AnalyticsEntityType =
  | 'event'
  | 'vendor'
  | 'dungeon'
  | 'swingClub'
  | 'organization'
  | 'group'
  | 'convention'
  | 'presenter'
  | 'venue'
  | 'article'

declare global {
  interface Window {
    gaConsent?: boolean
  }
}

/** Dispatched on `window` when analytics consent is granted so listeners can defer tracking until then. */
export const GA_CONSENT_EVENT = 'ecke_ga_consent'

export function markGaConsentGranted(): void {
  if (typeof window === 'undefined') return
  window.gaConsent = true
  window.dispatchEvent(new Event(GA_CONSENT_EVENT))
}

function canSend(): boolean {
  return typeof window !== 'undefined' && !!window.gaConsent && typeof window.gtag === 'function'
}

/** Stable slug for organizer dimensions when no org_slug exists in the data model. */
export function slugifyOrganizerName(name: string | null | undefined): string {
  if (!name?.trim()) return ''
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

export type EntityAnalyticsPayload = {
  entityType: AnalyticsEntityType
  slug: string
  name: string
  /** Human organizer / org display name when known */
  organizerName?: string | null
  /** Prefer kink.social org_slug; falls back to slugify(organizerName) */
  organizerSlug?: string | null
  itemListName?: string
  pagePath?: string
}

function resolveOrganizerSlug(args: EntityAnalyticsPayload): string {
  const explicit = args.organizerSlug?.trim()
  if (explicit) return explicit.toLowerCase()
  return slugifyOrganizerName(args.organizerName)
}

function entityDimensionParams(args: EntityAnalyticsPayload): Record<string, string> {
  const organizer_slug = resolveOrganizerSlug(args)
  const organizer_name = (args.organizerName || '').trim()
  const content_group =
    args.entityType === 'event'
      ? 'Events'
      : args.entityType === 'dungeon' || args.entityType === 'swingClub' || args.entityType === 'venue'
        ? 'Places'
        : args.entityType === 'vendor'
          ? 'Vendors'
          : args.entityType === 'article'
            ? 'Education'
            : 'Listings'

  return {
    content_group,
    entity_type: args.entityType,
    entity_slug: args.slug,
    entity_name: args.name,
    ...(organizer_name ? { organizer_name } : {}),
    ...(organizer_slug ? { organizer_slug } : {}),
  }
}

export function trackSelectItemEntity(args: {
  entityType: AnalyticsEntityType
  slug: string
  name: string
  itemListName: string
  organizerName?: string | null
  organizerSlug?: string | null
}): void {
  if (!canSend()) return
  const dims = entityDimensionParams(args)
  window.gtag!('event', 'select_item', {
    item_list_name: args.itemListName,
    ...dims,
    items: [
      {
        item_id: args.slug,
        item_name: args.name,
        item_category: args.entityType,
        item_brand: dims.organizer_name || undefined,
      },
    ],
  })
}

/**
 * Fire on public detail pages so GA4 can break down landings by entity / organizer.
 * Does not send a second `page_view` (SPA already records path/title via GoogleAnalytics).
 * Use Explorations on `view_item` or `entity_page_view` for entity_slug / organizer_slug.
 */
export function trackEntityPageView(args: EntityAnalyticsPayload): void {
  if (!canSend()) return
  const dims = entityDimensionParams(args)
  const page_path =
    args.pagePath ||
    (typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : `/${args.entityType}/${args.slug}`)
  const page_title = typeof document !== 'undefined' ? document.title : args.name

  // Attach dimensions to the hit stream without creating an extra page_view.
  window.gtag!('set', dims)

  window.gtag!('event', 'entity_page_view', {
    page_path,
    page_title,
    ...dims,
  })

  window.gtag!('event', 'view_item', {
    page_path,
    page_title,
    ...dims,
    items: [
      {
        item_id: args.slug,
        item_name: args.name,
        item_category: args.entityType,
        item_brand: dims.organizer_name || undefined,
      },
    ],
  })
}

export function trackOutboundEntityClick(args: {
  entityType: AnalyticsEntityType
  slug: string
  name: string
  url: string
  organizerName?: string | null
  organizerSlug?: string | null
}): void {
  if (!canSend()) return
  let link_domain = ''
  try {
    link_domain = new URL(args.url, window.location.origin).hostname
  } catch {
    /* ignore */
  }
  const dims = entityDimensionParams(args)
  window.gtag!('event', 'outbound_click', {
    ...dims,
    link_url: args.url,
    link_domain,
  })
}
