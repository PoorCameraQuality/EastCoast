import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { vendorDiscoveryPaths } from './eckeVendorDiscoveryShared'
import { RESERVED_VENDOR_SLUGS, buildShopSeoKeywords, slugifyShopSlug } from './eckeOrgVendorShared'

describe('vendor shop discovery SEO helpers', () => {
  it('pings the shop plus vendor index, state hub, and craft hubs', () => {
    assert.deepEqual(
      vendorDiscoveryPaths({
        slug: 'harbor-leather',
        stateAbbr: 'PA',
        seoHubTags: ['leather', 'impact'],
        onlineOnly: false,
      }),
      [
        '/vendors/harbor-leather',
        '/vendors',
        '/vendors/pennsylvania',
        '/vendors/leather',
        '/vendors/pennsylvania/leather',
        '/vendors/impact',
        '/vendors/pennsylvania/impact',
      ],
    )
  })

  it('adds the online hub and skips a state hub when the shop is online-only', () => {
    assert.deepEqual(
      vendorDiscoveryPaths({
        slug: 'mail-order-rope',
        seoHubTags: ['rope'],
        onlineOnly: true,
      }),
      ['/vendors/mail-order-rope', '/vendors', '/vendors/online', '/vendors/rope'],
    )
  })

  it('reserves discovery slugs and builds keywords from name and place', () => {
    assert.equal(RESERVED_VENDOR_SLUGS.has('my-shop'), true)
    assert.equal(RESERVED_VENDOR_SLUGS.has('login'), true)
    assert.equal(RESERVED_VENDOR_SLUGS.has('leather'), true)
    assert.equal(slugifyShopSlug('Harbor Leather'), 'harbor-leather')
    assert.deepEqual(
      buildShopSeoKeywords({
        name: 'Harbor Leather',
        city: 'Harrisburg',
        state: 'pa',
        hubTags: ['leather'],
      }),
      ['Harbor Leather', 'Harrisburg', 'PA', 'leather', 'kink vendor', 'BDSM shop'],
    )
  })
})
