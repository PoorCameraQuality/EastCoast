import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { dungeonDiscoveryPaths } from './eckeDungeonDiscoveryShared'
import { RESERVED_PLACE_SLUGS, buildPlaceSeoKeywords, slugifyPlaceSlug } from './eckeOrgDungeonShared'

describe('org place discovery SEO helpers', () => {
  it('pings the location plus dungeon index, state hub, and selected tags', () => {
    assert.deepEqual(
      dungeonDiscoveryPaths({
        slug: 'harbor-dungeon',
        stateAbbr: 'PA',
        seoHubTags: ['members-only', 'classes', 'not-a-tag'],
      }),
      [
        '/dungeons/harbor-dungeon',
        '/dungeons',
        '/dungeons/pennsylvania',
        '/dungeons/members-only',
        '/dungeons/pennsylvania/members-only',
        '/dungeons/classes',
        '/dungeons/pennsylvania/classes',
      ],
    )
  })

  it('reserves discovery slugs and builds keywords from name and place', () => {
    assert.equal(RESERVED_PLACE_SLUGS.has('my-place'), true)
    assert.equal(RESERVED_PLACE_SLUGS.has('login'), true)
    assert.equal(RESERVED_PLACE_SLUGS.has('members-only'), true)
    assert.equal(slugifyPlaceSlug('Harbor Dungeon'), 'harbor-dungeon')
    assert.deepEqual(
      buildPlaceSeoKeywords({
        name: 'Harbor Dungeon',
        city: 'Harrisburg',
        state: 'pa',
        kind: 'dungeon',
        hubTags: ['members-only'],
      }),
      ['Harbor Dungeon', 'Harrisburg', 'PA', 'Dungeon', 'members-only', 'kink dungeon', 'BDSM club'],
    )
  })
})
