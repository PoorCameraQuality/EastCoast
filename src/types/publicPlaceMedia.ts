export type PublicPlaceMediaKind =
  | 'interior'
  | 'exterior'
  | 'equipment'
  | 'classroom'
  | 'social_area'
  | 'vendor_area'
  | 'stage'
  | 'accessibility'
  | 'parking'
  | 'map_or_layout'
  | 'logo'
  | 'other'

export type PublicPlaceMedia = {
  id: string
  url: string
  alt: string
  caption?: string
  mediaKind: PublicPlaceMediaKind
  sourceSystem: 'ecke' | 'kink_social'
  moderationStatus: 'approved'
  containsPeople: boolean
  consentCleared: boolean
  publicSafe: boolean
  sortOrder?: number
}
