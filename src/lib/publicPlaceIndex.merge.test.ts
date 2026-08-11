import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mergePlaceListings } from './publicPlaceIndex'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

function listing(partial: Partial<PublicPlaceListing> & Pick<PublicPlaceListing, 'slug' | 'detailPath' | 'sourceSystem'>): PublicPlaceListing {
  return {
    id: partial.id ?? partial.slug,
    slug: partial.slug,
    name: partial.name ?? partial.slug,
    routeKind: partial.routeKind ?? (partial.detailPath.startsWith('/dungeons/') ? 'dungeon' : 'venue'),
    detailPath: partial.detailPath,
    placeType: partial.placeType ?? 'dungeon',
    city: partial.city ?? 'Anchorage',
    state: partial.state ?? 'AK',
    venuePrivacyMode: partial.venuePrivacyMode ?? 'city_only',
    sourceSystem: partial.sourceSystem,
    status: 'published',
  }
}

describe('mergePlaceListings dungeon vs venue path preference', () => {
  it('keeps /dungeons when a thin /venues listing collides on slug', () => {
    const merged = mergePlaceListings([
      listing({
        slug: 'alaska-club-kink-anchorage',
        detailPath: '/dungeons/alaska-club-kink-anchorage',
        sourceSystem: 'kink_social',
        name: 'Alaska Club Kink',
      }),
      listing({
        slug: 'alaska-club-kink-anchorage',
        detailPath: '/venues/alaska-club-kink-anchorage',
        sourceSystem: 'kink_social',
        name: 'Alaska Club Kink (thin)',
      }),
    ])
    assert.equal(merged.length, 1)
    assert.equal(merged[0]!.detailPath, '/dungeons/alaska-club-kink-anchorage')
  })

  it('upgrades /venues to /dungeons when dungeon listing arrives later', () => {
    const merged = mergePlaceListings([
      listing({
        slug: 'alaska-club-kink-anchorage',
        detailPath: '/venues/alaska-club-kink-anchorage',
        sourceSystem: 'kink_social',
      }),
      listing({
        slug: 'alaska-club-kink-anchorage',
        detailPath: '/dungeons/alaska-club-kink-anchorage',
        sourceSystem: 'kink_social',
        routeKind: 'dungeon',
      }),
    ])
    assert.equal(merged[0]!.detailPath, '/dungeons/alaska-club-kink-anchorage')
    assert.equal(merged[0]!.routeKind, 'dungeon')
  })

  it('lets kink.social replace static ecke on same slug', () => {
    const merged = mergePlaceListings([
      listing({
        slug: 'alaska-club-kink-anchorage',
        detailPath: '/dungeons/alaska-club-kink-anchorage',
        sourceSystem: 'ecke',
        name: 'Static',
      }),
      listing({
        slug: 'alaska-club-kink-anchorage',
        detailPath: '/dungeons/alaska-club-kink-anchorage',
        sourceSystem: 'kink_social',
        name: 'From kink.social',
      }),
    ])
    assert.equal(merged[0]!.name, 'From kink.social')
    assert.equal(merged[0]!.sourceSystem, 'kink_social')
  })
})
