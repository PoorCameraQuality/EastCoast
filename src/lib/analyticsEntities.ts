/**
 * GA4 helpers for listing clicks (select_item) and outbound entity CTAs.
 * Fires only when gtag is loaded and `window.gaConsent` is true (set after age verification).
 */

export type AnalyticsEntityType = 'event' | 'vendor' | 'dungeon'

declare global {
  interface Window {
    gaConsent?: boolean
  }
}

/** Dispatched on `window` after age verification so listeners can defer tracking until consent. */
export const GA_CONSENT_EVENT = 'ecke_ga_consent'

export function markGaConsentGranted(): void {
  if (typeof window === 'undefined') return
  window.gaConsent = true
  window.dispatchEvent(new Event(GA_CONSENT_EVENT))
}

function canSend(): boolean {
  return typeof window !== 'undefined' && !!window.gaConsent && typeof window.gtag === 'function'
}

export function trackSelectItemEntity(args: {
  entityType: AnalyticsEntityType
  slug: string
  name: string
  itemListName: string
}): void {
  if (!canSend()) return
  window.gtag!('event', 'select_item', {
    item_list_name: args.itemListName,
    items: [
      {
        item_id: args.slug,
        item_name: args.name,
        item_category: args.entityType,
      },
    ],
  })
}

export function trackOutboundEntityClick(args: {
  entityType: AnalyticsEntityType
  slug: string
  name: string
  url: string
}): void {
  if (!canSend()) return
  let link_domain = ''
  try {
    link_domain = new URL(args.url, window.location.origin).hostname
  } catch {
    /* ignore */
  }
  window.gtag!('event', 'outbound_click', {
    entity_type: args.entityType,
    entity_slug: args.slug,
    entity_name: args.name,
    link_url: args.url,
    link_domain,
  })
}
