import assert from 'node:assert/strict'
import { vendorToListing } from './publicVendorIndex'
import type { UnifiedVendor } from './unifiedVendors'

function testC2kVendorMapsToKinkSocialListing() {
  const vendor: UnifiedVendor = {
    slug: 'rope-co',
    name: 'Rope Co',
    description: 'Handmade rope',
    location: 'Baltimore, MD',
    tagSlugs: ['rope-suspension'],
    logo125Url: 'https://kink.social/c2k-uploads/vendors/logo.png',
    coverUrl: 'https://kink.social/c2k-uploads/vendors/cover.png',
    listings: [
      {
        id: 'listing-1',
        title: 'Hemp kit',
        imageUrl: 'https://cdn.example/hemp.jpg',
        priceLabel: '$48.00',
        externalUrl: 'https://shop.example.com/hemp',
        sourceSystem: 'native',
        sortOrder: 0,
      },
    ],
    acceptsCommissions: true,
    kinkSocialCanonicalPath: '/vendors/rope-co',
    c2kSourceId: '22222222-2222-2222-2222-222222222222',
    c2kSourceType: 'vendor_profile',
    stateAbbr: 'MD',
    city: 'Baltimore',
    onlineOnly: false,
    lastSyncedAt: '2026-09-02',
  }

  const listing = vendorToListing(vendor, {})

  assert.equal(listing.sourceSystem, 'kink_social')
  assert.equal(listing.featuredProducts?.[0]?.priceLabel, '$48.00')
  assert.equal(listing.logoUrl, vendor.logo125Url)
  assert.equal(listing.coverImageUrl, vendor.coverUrl)
  assert.match(listing.kinkSocialVendorUrl ?? '', /\/vendors\/rope-co/)
  assert.equal(listing.acceptsCommissions, true)
  assert.equal(listing.lastSyncedAt, '2026-09-02')
}

testC2kVendorMapsToKinkSocialListing()
console.log('publicVendorIndex.c2k.test.ts: ok')
