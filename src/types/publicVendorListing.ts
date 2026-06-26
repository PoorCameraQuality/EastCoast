import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicVendorMedia, PublicVendorProduct } from '@/types/publicVendorProduct'

export type PublicVendorType =
  | 'maker'
  | 'reseller'
  | 'artist'
  | 'author'
  | 'educator_vendor'
  | 'service_provider'
  | 'event_vendor'
  | 'custom_commission'
  | 'other'

export type PublicVendorSupporterTier = 'none' | 'supporter' | 'featured'

export type PublicVendorListing = {
  id: string
  slug: string
  name: string

  shortSummary?: string
  description?: string
  tagline?: string

  vendorType?: PublicVendorType
  productCategories?: string[]
  craftTags?: string[]
  tagSlugs: string[]

  city?: string
  state?: string
  country?: string
  locationLabel?: string
  onlineOnly?: boolean

  logoUrl?: string
  coverImageUrl?: string
  gallery?: PublicVendorMedia[]
  featuredProducts?: PublicVendorProduct[]

  shopUrl?: string
  etsyUrl?: string
  shopifyUrl?: string
  wooUrl?: string
  websiteUrl?: string
  contactUrl?: string

  acceptsCommissions?: boolean
  commissionInfo?: string

  tabledAtEvents?: PublicEventIndexItem[]
  upcomingVendorEvents?: PublicEventIndexItem[]

  kinkSocialVendorUrl?: string
  followUrl?: string
  claimUrl?: string

  supporterTier?: PublicVendorSupporterTier
  dungeonListingSlug?: string

  sourceSystem: 'ecke' | 'kink_social' | 'external'
  sourceId?: string
  lastSyncedAt?: string

  status: 'published' | 'archived'
}

export type VendorCategoryChip = {
  id: string
  label: string
  tagSlugs: string[]
}

export const VENDOR_CATEGORY_CHIPS: VendorCategoryChip[] = [
  { id: 'leather', label: 'Leather', tagSlugs: ['handmade-leather', 'leather'] },
  { id: 'impact', label: 'Impact', tagSlugs: ['impact-implements', 'impact-play'] },
  { id: 'rope', label: 'Rope', tagSlugs: ['rope-suspension', 'restraints-bondage-gear', 'rope-fabric'] },
  { id: 'jewelry', label: 'Jewelry', tagSlugs: ['jewelry-collars', 'metalwork-chain-jewelry'] },
  { id: 'clothing', label: 'Clothing', tagSlugs: ['clothing-fetish-wear', 'textile-clothing-maker', 'roleplay-costume'] },
  { id: 'furniture', label: 'Furniture', tagSlugs: ['dungeon-equipment-furniture', 'woodworking'] },
  { id: 'books', label: 'Books', tagSlugs: ['media-education-products'] },
  { id: 'art', label: 'Art', tagSlugs: ['photography-content', 'mixed-media-maker', 'resin-acrylic'] },
  { id: 'aftercare', label: 'Aftercare', tagSlugs: ['decor-lifestyle-aftercare'] },
  { id: 'commissions', label: 'Custom commissions', tagSlugs: ['custom-commission-vendor', 'custom-orders-available'] },
]
