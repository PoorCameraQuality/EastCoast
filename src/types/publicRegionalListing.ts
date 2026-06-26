export type RegionalListingType =
  | 'event'
  | 'convention'
  | 'place'
  | 'vendor'
  | 'education'
  | 'organization'
  | 'group'
  | 'presenter'
  | 'class'
  | 'article'

export type RegionalLocationMode =
  | 'public'
  | 'city_only'
  | 'region_only'
  | 'state_only'
  | 'online'
  | 'nationwide'
  | 'multi_state'
  | 'hidden_until_registered'
  | 'contact_for_location'

export type PublicRegionalListing = {
  id: string
  slug: string
  title: string

  listingType: RegionalListingType
  href: string

  city?: string
  state?: string
  regionLabel?: string
  country?: string

  locationMode: RegionalLocationMode

  startsAt?: string
  endsAt?: string

  summary?: string
  tags?: string[]
  categories?: string[]

  logoUrl?: string
  coverImageUrl?: string
  imageUrl?: string

  organizerName?: string
  organizationName?: string

  dancecardEnabled?: boolean
  newFriendly?: boolean
  registrationOpen?: boolean
  hasUpcomingEvents?: boolean

  sourceSystem: 'ecke' | 'kink_social' | 'external' | 'fallback'
  sourceId?: string
  sourceAttribution?: string
  lastSyncedAt?: string

  status: 'published' | 'archived' | 'cancelled' | 'postponed'
}
