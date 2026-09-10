import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { eventMatchesPlace } from './publicPlaceIndex'
import { parseEventsListIntent, eventsListHasActiveFilter, buildEventsListUrl } from './eventsListSearchParams'
import {
  expandEventRegionFilter,
  eventMatchesRegion,
  timezoneToEventRegionCluster,
} from './eventDiscoveryRegions'
import {
  applyPlaceLinkToEventInput,
  dbEventTypeToOrgKind,
  orgKindToDbEventType,
  type OwnedPlaceLink,
} from './eckeOrgEventShared'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

function place(partial: Partial<PublicPlaceListing> & Pick<PublicPlaceListing, 'id' | 'slug' | 'name'>): PublicPlaceListing {
  return {
    id: partial.id,
    slug: partial.slug,
    name: partial.name,
    routeKind: 'dungeon',
    detailPath: `/dungeons/${partial.slug}`,
    placeType: 'dungeon',
    city: partial.city ?? 'Baltimore',
    state: partial.state ?? 'MD',
    venuePrivacyMode: 'city_only',
    sourceSystem: 'ecke',
    status: 'published',
  }
}

function event(partial: Partial<PublicEventIndexItem> & Pick<PublicEventIndexItem, 'slug' | 'title'>): PublicEventIndexItem {
  return {
    id: partial.id ?? partial.slug,
    slug: partial.slug,
    title: partial.title,
    listingKind: partial.listingKind ?? 'event',
    startsAt: '2026-10-01',
    endsAt: '2026-10-01',
    dateDisplay: 'Oct 1, 2026',
    city: 'Baltimore',
    state: 'MD',
    tags: [],
    category: 'Play party',
    organizerName: partial.organizerName,
    dungeonSlug: partial.dungeonSlug,
    dungeonVenueId: partial.dungeonVenueId,
    sourceSystem: 'ecke',
    status: 'published',
  }
}

describe('dungeon event linking', () => {
  it('matches by dungeon_venue_id and ignores name collisions on other places', () => {
    const playhouse = place({ id: 'venue-1', slug: 'baltimore-playhouse', name: 'Baltimore Playhouse' })
    const other = place({ id: 'venue-2', slug: 'baltimore-dungeon', name: 'Baltimore Playhouse Annex' })
    const night = event({
      slug: 'friday-play',
      title: 'Friday Play at Baltimore Playhouse Annex',
      dungeonVenueId: 'venue-1',
    })
    assert.equal(eventMatchesPlace(playhouse, night), true)
    assert.equal(eventMatchesPlace(other, night), false)
  })

  it('matches unlinked events by dungeon_slug then name heuristic', () => {
    const playhouse = place({ id: 'baltimore-playhouse', slug: 'baltimore-playhouse', name: 'Baltimore Playhouse' })
    const bySlug = event({ slug: 'rope-night', title: 'Rope Night', dungeonSlug: 'baltimore-playhouse' })
    const byName = event({ slug: 'munch', title: 'Baltimore Playhouse Munch' })
    const elsewhere = event({ slug: 'other', title: 'Harrisburg Social' })
    assert.equal(eventMatchesPlace(playhouse, bySlug), true)
    assert.equal(eventMatchesPlace(playhouse, byName), true)
    assert.equal(eventMatchesPlace(playhouse, elsewhere), false)
  })
})

describe('events list discovery', () => {
  it('defaults /events to conventions and keeps the bare URL indexable', () => {
    assert.equal(parseEventsListIntent({}), 'conventions')
    assert.equal(eventsListHasActiveFilter({}), false)
    assert.equal(buildEventsListUrl('conventions'), '/events')
    assert.equal(buildEventsListUrl('all'), '/events')
    assert.equal(parseEventsListIntent({ intent: 'all' }), 'conventions')
    assert.equal(buildEventsListUrl('local', 'PA'), '/events?intent=local&location=PA')
  })

  it('expands region clusters and exact states', () => {
    assert.equal(expandEventRegionFilter('east-coast')?.includes('MD'), true)
    assert.deepEqual(expandEventRegionFilter('PA'), ['PA'])
    assert.equal(eventMatchesRegion('MD', 'east-coast'), true)
    assert.equal(eventMatchesRegion('CA', 'east-coast'), false)
    assert.equal(timezoneToEventRegionCluster('America/New_York'), 'east-coast')
    assert.equal(timezoneToEventRegionCluster('America/Los_Angeles'), 'west')
  })
})

describe('applyPlaceLinkToEventInput', () => {
  const dungeon: OwnedPlaceLink = {
    id: 'place-1',
    slug: 'harbor-dungeon-test',
    name: 'Harbor Dungeon Test',
    city: 'Harrisburg',
    state: 'PA',
    street_address: '123 Front St',
    private_address: false,
  }

  it('fills venue and geo from the owned place when hosting there', () => {
    const linked = applyPlaceLinkToEventInput(
      {
        title: 'Friday Play',
        shortDescription: 'A play night at the dungeon for regulars.',
        kind: 'play_event',
        startDate: '2026-10-02',
        endDate: '2026-10-02',
        longDescription: '<p>Doors at 8.</p>',
        hostAtPlace: true,
      },
      dungeon,
      true,
    )
    assert.equal(linked.placeLink.dungeon_venue_id, 'place-1')
    assert.equal(linked.placeLink.dungeon_slug, 'harbor-dungeon-test')
    assert.equal(linked.input.venue, 'Harbor Dungeon Test')
    assert.equal(linked.input.city, 'Harrisburg')
    assert.equal(linked.input.state, 'PA')
  })

  it('clears the place link when the organizer unchecks it', () => {
    const linked = applyPlaceLinkToEventInput(
      {
        title: 'Hotel Weekend',
        shortDescription: 'A traveling convention weekend away from home.',
        kind: 'convention',
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        longDescription: '<p>Hotel event.</p>',
        city: 'Philadelphia',
        state: 'PA',
        hostAtPlace: false,
      },
      dungeon,
      false,
    )
    assert.equal(linked.placeLink.dungeon_venue_id, null)
    assert.equal(linked.input.city, 'Philadelphia')
  })
})

describe('org event type mapping', () => {
  it('maps form kinds onto the events_event_type_check values', () => {
    assert.equal(orgKindToDbEventType('play_event'), 'play_party')
    assert.equal(orgKindToDbEventType('party'), 'play_party')
    assert.equal(orgKindToDbEventType('educational'), 'class')
    assert.equal(orgKindToDbEventType('munch'), 'munch')
    assert.equal(orgKindToDbEventType('social'), 'social')
    assert.equal(orgKindToDbEventType('convention'), 'convention')
    assert.equal(orgKindToDbEventType('retreat'), 'convention')
    assert.equal(orgKindToDbEventType('fundraiser'), 'social')
    assert.equal(orgKindToDbEventType('other'), 'social')
  })

  it('maps stored discovery types back to form kinds', () => {
    assert.equal(dbEventTypeToOrgKind('play_party'), 'play_event')
    assert.equal(dbEventTypeToOrgKind('class'), 'educational')
    assert.equal(dbEventTypeToOrgKind('social'), 'social')
    assert.equal(dbEventTypeToOrgKind(null), 'other')
  })
})
