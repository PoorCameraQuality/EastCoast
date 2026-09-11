import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  HOMEPAGE_ROTATION_HOURS,
  catalogItemEligible,
  channelSeed,
  homepageRotationSeed,
  pickRotated,
  pickRotatedBySlug,
  seededShuffle,
} from './homepageRotation'

describe('homepageRotation seeded picker', () => {
  it('is stable for the same seed and changes across seeds', () => {
    const slugs = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel']
    const a = pickRotated(slugs, 3, 1001)
    const aAgain = pickRotated(slugs, 3, 1001)
    const b = pickRotated(slugs, 3, 2002)

    assert.deepEqual(a, aAgain)
    assert.notDeepEqual(a, b)
  })

  it('ignores input order when picking by slug', () => {
    const forward = [
      { slug: 'zebra-works' },
      { slug: 'alpha-leather' },
      { slug: 'midtown-rope' },
    ]
    const reverse = [...forward].reverse()
    assert.deepEqual(pickRotatedBySlug(forward, 2, 42), pickRotatedBySlug(reverse, 2, 42))
  })

  it('keeps independent rails from sharing one shuffle', () => {
    const slugs = ['one', 'two', 'three', 'four', 'five', 'six']
    const vendors = pickRotated(slugs, 3, channelSeed(9, 'vendors'))
    const spaces = pickRotated(slugs, 3, channelSeed(9, 'spaces'))
    assert.notDeepEqual(vendors, spaces)
  })

  it('uses a 6-hour UTC bucket so SSR and hydrate share a seed', () => {
    const inside = new Date('2026-09-10T13:10:00.000Z')
    const sameWindow = new Date('2026-09-10T17:59:00.000Z')
    const nextWindow = new Date('2026-09-10T18:00:00.000Z')
    assert.equal(HOMEPAGE_ROTATION_HOURS, 6)
    assert.equal(homepageRotationSeed(inside), homepageRotationSeed(sameWindow))
    assert.notEqual(homepageRotationSeed(inside), homepageRotationSeed(nextWindow))
  })

  it('skips empty names and test catalog slugs', () => {
    assert.equal(catalogItemEligible('flogging-farmers', 'Flogging Farmers'), true)
    assert.equal(catalogItemEligible('harbor-dungeon-test', 'Harbor Test'), false)
    assert.equal(catalogItemEligible('calendar-forge-playhouse', 'Calendar Forge'), false)
    assert.equal(catalogItemEligible('harbor-leather-test', 'Harbor Leather'), false)
    assert.equal(catalogItemEligible('preview-c2k-weekend', 'Preview'), false)
    assert.equal(catalogItemEligible('quiet-club', ''), false)
    assert.equal(catalogItemEligible('', 'Nameless'), false)
  })

  it('does not call Math.random while shuffling', () => {
    const original = Math.random
    Math.random = () => {
      throw new Error('Math.random must not run during seeded shuffle')
    }
    try {
      assert.equal(seededShuffle(['a', 'b', 'c', 'd'], 7).length, 4)
    } finally {
      Math.random = original
    }
  })
})
