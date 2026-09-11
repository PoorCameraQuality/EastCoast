import assert from 'node:assert/strict'
import {
  attachVendorEvents,
  eventIsVendorAppearance,
  eventMatchesVendor,
  vendorToListing,
} from './publicVendorIndex'
import type { UnifiedEvent } from './unifiedEvents'
import type { PublicVendorListing } from '@/types/publicVendorListing'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

function baseVendor(partial: Partial<PublicVendorListing> = {}): PublicVendorListing {
  return {
    id: 'holo-leather',
    slug: 'holo-leather',
    name: 'HOLO Leather',
    tagSlugs: ['handmade-leather', 'leather', 'vegan-leather'],
    sourceSystem: 'ecke',
    status: 'published',
    organizationId: 'org-holo',
    ...partial,
  }
}

function baseEvent(partial: Partial<PublicEventIndexItem> = {}): PublicEventIndexItem {
  return {
    id: 'evt',
    slug: 'pride-leather-weekend',
    title: 'PRIDE LEATHER WEEKEND',
    listingKind: 'event',
    startsAt: '2026-09-18',
    endsAt: '2026-09-20',
    dateDisplay: 'Sep 18, 2026',
    city: 'Phoenix',
    state: 'AZ',
    tags: [],
    category: 'Event',
    sourceSystem: 'ecke',
    status: 'published',
    ...partial,
  }
}

function testFuzzyLeatherNoLongerMatchesOrgShops() {
  const vendor = baseVendor()
  const leatherNight = baseEvent()
  assert.equal(eventMatchesVendor(vendor, leatherNight), false)
  assert.equal(eventIsVendorAppearance(vendor, leatherNight, null), false)
}

function testOwnedEventMatchesOrgShop() {
  const vendor = baseVendor()
  const folsom = baseEvent({
    slug: 'folsom',
    title: 'Folsom Street Faire',
    city: 'San Francisco',
    state: 'CA',
  })
  assert.equal(eventIsVendorAppearance(vendor, folsom, 'org-holo'), true)
}

function testExplicitAppearanceSlugMatches() {
  const vendor = baseVendor({ appearanceEventSlugs: ['grand-strand-affair-2026'] })
  const gsa = baseEvent({
    slug: 'grand-strand-affair-2026',
    title: 'Grand Strand Affair 2026',
  })
  assert.equal(eventIsVendorAppearance(vendor, gsa, null), true)
}

function testAttachVendorEventsUsesOwnership() {
  const listing = vendorToListing(
    {
      slug: 'holo-leather',
      name: 'HOLO Leather',
      description: 'Short blurb for the masthead.',
      story: 'Longer story about HOLO Leather craft.',
      location: 'Sugar Hill, GA',
      tagSlugs: ['handmade-leather'],
      organizationId: 'org-holo',
      appearanceEventSlugs: [],
      stateAbbr: 'GA',
      city: 'Sugar Hill',
      onlineOnly: false,
    },
    {
      'handmade-leather': {
        slug: 'handmade-leather',
        name: 'Handmade Leather',
        group: 'materials',
      } as never,
    }
  )
  assert.equal(listing.shortSummary, 'Short blurb for the masthead.')

  const events: UnifiedEvent[] = [
    {
      name: 'PRIDE LEATHER WEEKEND',
      slug: 'pride-leather-weekend',
      date: { start: '2026-09-18', end: '2026-09-20', display: 'Sep 18' },
      location: { city: 'Phoenix', state: 'AZ', region: '' },
      excerpt: '',
      category: 'Event',
      tagSlugs: [],
      source: 'supabase',
      organizationId: null,
    },
    {
      name: 'Folsom Street Faire',
      slug: 'folsom',
      date: { start: '2026-09-27', end: '2026-09-27', display: 'Sep 27' },
      location: { city: 'San Francisco', state: 'CA', region: '' },
      excerpt: '',
      category: 'Event',
      tagSlugs: [],
      source: 'supabase',
      organizationId: 'org-holo',
    },
  ]

  const [withEvents] = attachVendorEvents([listing], events)
  assert.equal(withEvents.upcomingVendorEvents?.length, 1)
  assert.equal(withEvents.upcomingVendorEvents?.[0]?.slug, 'folsom')
}

testFuzzyLeatherNoLongerMatchesOrgShops()
testOwnedEventMatchesOrgShop()
testExplicitAppearanceSlugMatches()
testAttachVendorEventsUsesOwnership()
console.log('publicVendorIndex.appearances.test.ts: ok')
