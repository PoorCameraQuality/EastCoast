import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceMedia } from '@/types/publicPlaceMedia'

export type PublicPlaceType =
  | 'dungeon'
  | 'swing_lifestyle_club'
  | 'community_space'
  | 'education_space'
  | 'event_venue'
  | 'studio'
  | 'campground'
  | 'retail_and_events'
  | 'private_club'
  | 'other'

export type VenuePrivacyMode =
  | 'public_address'
  | 'city_only'
  | 'approximate_area'
  | 'hidden_until_registered'
  | 'contact_for_location'

export type PublicPlaceStatus = 'published' | 'archived' | 'temporarily_closed'

export type PublicPlaceRouteKind = 'dungeon' | 'swing_club' | 'venue'

export type PublicPlaceListing = {
  id: string
  slug: string
  name: string
  routeKind: PublicPlaceRouteKind
  detailPath: string

  placeType: PublicPlaceType
  shortSummary?: string
  description?: string

  city: string
  state: string
  regionLabel?: string

  venuePrivacyMode: VenuePrivacyMode
  publicAddress?: string
  mapUrl?: string
  websiteUrl?: string
  registrationUrl?: string
  contactUrl?: string
  contactEmail?: string
  contactPhone?: string

  logoUrl?: string
  coverImageUrl?: string
  gallery?: PublicPlaceMedia[]

  amenities?: string[]
  accessibilityNotes?: string
  parkingInfo?: string
  membershipInfo?: string
  agePolicy?: string
  dressCode?: string
  consentPolicySummary?: string
  alcoholPolicy?: string
  smokingPolicy?: string
  photographyPolicy?: string
  firstTimerInfo?: string
  hours?: string

  categoryLabel?: string
  newFriendly?: boolean
  membershipRequired?: boolean
  orientationRequired?: boolean

  upcomingEventCount?: number
  upcomingEvents?: PublicEventIndexItem[]

  kinkSocialPlaceUrl?: string
  kinkSocialOrganizationUrl?: string
  followUrl?: string
  claimUrl?: string
  organizerName?: string

  sourceSystem: 'ecke' | 'kink_social'
  sourceId?: string
  sourceAttribution?: string
  lastSyncedAt?: string

  status: PublicPlaceStatus
}

export type PlaceListIntent =
  | 'all'
  | 'dungeons'
  | 'swing-clubs'
  | 'education'
  | 'studios'
  | 'retail'
  | 'campgrounds'
  | 'new-friendly'
  | 'public-address'
  | 'events-this-month'
  | 'kink-social'

export const PLACE_INTENT_OPTIONS: { id: PlaceListIntent; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'dungeons', label: 'Dungeons' },
  { id: 'swing-clubs', label: 'Swing / lifestyle clubs' },
  { id: 'education', label: 'Education spaces' },
  { id: 'studios', label: 'Studios' },
  { id: 'retail', label: 'Retail + events' },
  { id: 'campgrounds', label: 'Campgrounds' },
  { id: 'new-friendly', label: 'New-friendly' },
  { id: 'public-address', label: 'Public address' },
  { id: 'events-this-month', label: 'Events this month' },
  { id: 'kink-social', label: 'From kink.social' },
]
