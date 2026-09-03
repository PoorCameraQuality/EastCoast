import assert from 'node:assert/strict'
import {
  buildKinkSocialUrl,
  campaignForVariant,
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  getKinkSocialVendorShopUrl,
  kinkSocialVendorShopPath,
  KINK_SOCIAL_UTM,
} from './kinkSocialMarketing'

function testBuildKinkSocialUrl() {
  const url = new URL(buildKinkSocialUrl('/orgs/new', 'footer'))
  assert.equal(url.origin, 'https://kink.social')
  assert.equal(url.pathname, '/orgs/new')
  assert.equal(url.searchParams.get('utm_source'), KINK_SOCIAL_UTM.source)
  assert.equal(url.searchParams.get('utm_medium'), KINK_SOCIAL_UTM.medium)
  assert.equal(url.searchParams.get('utm_campaign'), KINK_SOCIAL_UTM.campaign)
  assert.equal(url.searchParams.get('utm_content'), 'footer')
}

function testCampaignForVariant() {
  assert.equal(campaignForVariant('home'), 'home_platform')
  assert.equal(campaignForVariant('eventDetail'), 'event_detail')
  assert.equal(campaignForVariant('dancecard'), 'dancecard')
}

function testJoinAndOrgUrls() {
  const join = new URL(getKinkSocialJoinUrl('events_index'))
  assert.equal(join.pathname, '/')
  assert.equal(join.searchParams.get('utm_content'), 'events_index')

  const org = new URL(getKinkSocialOrgUrl('organizer'))
  assert.equal(org.pathname, '/orgs/new')
  assert.equal(org.searchParams.get('utm_content'), 'organizer')
}

function testVendorShopUrl() {
  assert.equal(kinkSocialVendorShopPath('rope-co'), '/vendors/rope-co')
  const url = new URL(getKinkSocialVendorShopUrl('rope-co'))
  assert.equal(url.pathname, '/vendors/rope-co')
  assert.equal(url.searchParams.get('ecke_vendor'), 'rope-co')
}

testBuildKinkSocialUrl()
testCampaignForVariant()
testJoinAndOrgUrls()
testVendorShopUrl()

console.log('kinkSocialMarketing.test.ts: ok')
