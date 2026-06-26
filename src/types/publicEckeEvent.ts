/**
 * Public-safe ECKE event shape — target for kink.social publish payloads.
 * EventPageRecord today is a subset; extend mapping as ingest fields land.
 */

export type PublicMedia = {
  url: string
  alt?: string
  kind?: 'logo' | 'banner' | 'poster' | 'gallery'
}

export type PublicPresenterPreview = {
  name: string
  slug?: string
  headline?: string
  photoUrl?: string
}

export type PublicVendorPreview = {
  name: string
  slug?: string
  logoUrl?: string
}

export type PublicScheduleItem = {
  title: string
  startsAt?: string
  dayLabel?: string
}

export type PublicClassPreview = {
  title: string
  presenter?: string
}

export type VenuePrivacyMode = 'public' | 'approximate' | 'hidden_until_registered'

export type PublicEckeEventStatus = 'published' | 'archived' | 'cancelled' | 'postponed'

export type PublicEckeEvent = {
  id: string
  slug: string
  title: string
  subtitle?: string
  shortSummary?: string
  description?: string

  startsAt: string
  endsAt?: string
  timezone?: string

  city?: string
  state?: string
  regionLabel?: string
  venueName?: string
  venuePublicAddress?: string
  venuePrivacyMode?: VenuePrivacyMode

  eventType?: string
  categories?: string[]
  tags?: string[]

  officialUrl?: string
  ticketUrl?: string
  registrationUrl?: string

  logoUrl?: string
  bannerUrl?: string
  posterUrl?: string
  gallery?: PublicMedia[]

  organizerName?: string
  organizerSlug?: string
  organizationName?: string
  organizationSlug?: string
  organizerLogoUrl?: string

  presenters?: PublicPresenterPreview[]
  vendors?: PublicVendorPreview[]
  scheduleItems?: PublicScheduleItem[]
  classes?: PublicClassPreview[]

  priceRange?: string
  agePolicy?: string
  accessibilityNotes?: string
  dressCode?: string
  consentPolicySummary?: string
  covidHealthPolicy?: string
  parkingInfo?: string
  hotelInfo?: string

  dancecardEnabled?: boolean
  kinkSocialEventUrl?: string
  kinkSocialOrganizationUrl?: string
  kinkSocialGroupUrl?: string

  sourceSystem: 'ecke' | 'kink_social'
  sourceId?: string
  sourceAttribution?: string
  lastSyncedAt?: string
  status: PublicEckeEventStatus
}
