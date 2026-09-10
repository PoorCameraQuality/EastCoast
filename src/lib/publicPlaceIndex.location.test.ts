import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { placeLocationDisplay } from './publicPlaceIndex'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

function place(partial: Partial<PublicPlaceListing>): PublicPlaceListing {
  return {
    id: 'harbor',
    slug: 'harbor-dungeon-test',
    name: 'Harbor Dungeon Test',
    routeKind: 'dungeon',
    detailPath: '/dungeons/harbor-dungeon-test',
    placeType: 'dungeon',
    city: 'Harrisburg',
    state: 'PA',
    venuePrivacyMode: 'city_only',
    sourceSystem: 'ecke',
    status: 'published',
    ...partial,
  }
}

describe('placeLocationDisplay', () => {
  it('keeps city and state when the exact address is private', () => {
    assert.equal(placeLocationDisplay(place({ venuePrivacyMode: 'city_only' })), 'Harrisburg, PA')
  })

  it('does not invent an address for contact-for-location venues', () => {
    assert.equal(
      placeLocationDisplay(place({ venuePrivacyMode: 'contact_for_location' })),
      'Contact venue for location',
    )
  })

  it('shows the public address only when that privacy mode is set', () => {
    assert.equal(
      placeLocationDisplay(
        place({
          venuePrivacyMode: 'public_address',
          publicAddress: '123 Example St, Harrisburg, PA',
        }),
      ),
      '123 Example St, Harrisburg, PA',
    )
  })
})
