export type PublicEventListingKind = 'event' | 'convention'

export type PublicEventType =
  | 'class'
  | 'party'
  | 'munch'
  | 'vendor_market'
  | 'campout'
  | 'hotel_weekend'
  | 'online'
  | 'other'

export type PublicEventIndexStatus = 'published' | 'cancelled' | 'postponed' | 'archived'

export type PublicEventIndexItem = {
  id: string
  slug: string
  title: string
  listingKind: PublicEventListingKind
  eventType?: PublicEventType

  startsAt: string
  endsAt: string
  dateDisplay: string
  timezone?: string

  city: string
  state: string
  regionLabel?: string

  logoUrl?: string
  bannerUrl?: string

  summary?: string
  tags: string[]
  category: string

  organizerName?: string

  presenterCount?: number
  vendorCount?: number
  scheduleItemCount?: number

  dancecardEnabled?: boolean
  newFriendly?: boolean
  registrationOpen?: boolean

  sourceSystem: 'ecke' | 'kink_social'
  sourceId?: string
  lastSyncedAt?: string

  status: PublicEventIndexStatus
}
