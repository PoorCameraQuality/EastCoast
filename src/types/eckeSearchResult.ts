export type EckeSearchEntityType =
  | 'event'
  | 'convention'
  | 'place'
  | 'vendor'
  | 'education'
  | 'state'

export type EckeSearchResult = {
  id: string
  entityType: EckeSearchEntityType
  slug: string
  title: string
  href: string
  summary?: string
  category?: string
  locationLabel?: string
  state?: string
  city?: string
  logoUrl?: string
  dateDisplay?: string
  tags?: string[]
  sourceSystem: 'ecke' | 'kink_social' | 'external'
  relevanceScore: number
}

export type EckeSearchDocument = Omit<EckeSearchResult, 'relevanceScore'> & {
  searchText: string
}

export type EckeSearchResponse = {
  query: string
  results: EckeSearchResult[]
  total: number
  tookMs: number
}

export const ECKE_SEARCH_ENTITY_LABELS: Record<EckeSearchEntityType, string> = {
  event: 'Event',
  convention: 'Convention',
  place: 'Place',
  vendor: 'Vendor',
  education: 'Guide',
  state: 'State hub',
}
