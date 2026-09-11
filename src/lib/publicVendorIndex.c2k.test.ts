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
    websiteUrl: 'https://shop.example.com',
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
  assert.equal(listing.shopUrl, 'https://shop.example.com')
  assert.equal(listing.websiteUrl, 'https://shop.example.com')
  assert.equal(listing.acceptsCommissions, true)
  assert.equal(listing.lastSyncedAt, '2026-09-02')
}

function testC2kVendorDoesNotUseKinkSocialAsShopUrl() {
  const vendor: UnifiedVendor = {
    slug: 'holo-leather',
    name: 'HOLO Leather',
    description: 'Handcrafted leather',
    location: 'Sugar Hill, GA',
    tagSlugs: ['handmade-leather'],
    websiteUrl: 'https://kink.social/vendors/holo-leather',
    c2kSourceId: '25572bfc-673e-498e-8401-7729a7b67be8',
    c2kSourceType: 'vendor_profile',
    stateAbbr: 'GA',
    city: 'Sugar Hill',
    onlineOnly: false,
  }

  const listing = vendorToListing(vendor, {})
  assert.equal(listing.shopUrl, undefined)
  assert.equal(listing.websiteUrl, undefined)
  assert.match(listing.kinkSocialVendorUrl ?? '', /kink\.social/)
}

testC2kVendorMapsToKinkSocialListing()
testC2kVendorDoesNotUseKinkSocialAsShopUrl()
console.log('publicVendorIndex.c2k.test.ts: ok')
