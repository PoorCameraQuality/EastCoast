import assert from 'node:assert/strict'
import { isKinkSocialHostUrl, vendorOffsiteShopUrl } from './vendorOutboundUrls'

assert.equal(isKinkSocialHostUrl('https://kink.social/vendors/holo-leather'), true)
assert.equal(isKinkSocialHostUrl('https://www.kink.social/join'), true)
assert.equal(isKinkSocialHostUrl('https://www.hololeathers.com/'), false)
assert.equal(isKinkSocialHostUrl(''), false)

assert.equal(
  vendorOffsiteShopUrl('https://kink.social/vendors/holo-leather', 'https://www.hololeathers.com/'),
  'https://www.hololeathers.com/',
)
assert.equal(vendorOffsiteShopUrl('https://kink.social/vendors/rope-co'), undefined)
assert.equal(vendorOffsiteShopUrl(undefined, 'https://shop.example.com/hemp'), 'https://shop.example.com/hemp')

console.log('vendorOutboundUrls.test.ts: ok')
