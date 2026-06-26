export type PublicVendorProduct = {
  id: string
  title: string
  imageUrl?: string
  priceLabel?: string
  category?: string
  externalUrl?: string
  sourceSystem?: 'manual' | 'etsy' | 'shopify' | 'woo'
  publicSafe: boolean
  sortOrder?: number
}

export type PublicVendorMedia = {
  id: string
  url: string
  alt: string
  caption?: string
  mediaKind: 'product' | 'workshop' | 'booth' | 'logo' | 'other'
  sourceSystem: 'ecke' | 'kink_social' | 'external'
  publicSafe: boolean
  sortOrder?: number
}
