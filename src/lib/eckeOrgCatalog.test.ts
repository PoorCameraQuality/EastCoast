import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  conventionToListing,
  dungeonToOrgListing,
  isRedundantOrgDisplayName,
  isSkippedCatalogSlug,
  listingImageAlt,
  mergeConventionCatalog,
  mergeOrganizationCatalog,
  shouldIncludeCatalogListing,
  usableListingImageUrl,
} from './eckeOrgCatalog'
import type { KinkSocialListingRecord } from './unifiedExtendedListings'

function dbOrg(partial: Partial<KinkSocialListingRecord> & Pick<KinkSocialListingRecord, 'slug' | 'name'>): KinkSocialListingRecord {
  return {
    description: null,
    publicLocationSummary: null,
    logoUrl: null,
    kinkSocialCanonicalUrl: null,
    ctaUrl: null,
    orgSlug: null,
    orgDisplayName: null,
    websiteUrl: null,
    city: null,
    state: null,
    c2kSourceId: `db:${partial.slug}`,
    sourceAttribution: 'kink.social',
    lastSyncedAt: null,
    gallery: [],
    ...partial,
  }
}

describe('eckeOrgCatalog merge', () => {
  it('skips test slugs and lets existing DB orgs win', () => {
    assert.equal(isSkippedCatalogSlug('harbor-dungeon-test'), true)
    assert.equal(isSkippedCatalogSlug('preview-c2k-weekend'), true)
    assert.equal(isSkippedCatalogSlug('calendar-forge-playhouse'), true)
    assert.equal(isSkippedCatalogSlug('charmed-test'), true)
    assert.equal(isSkippedCatalogSlug('baltimore-playhouse'), false)

    const merged = mergeOrganizationCatalog(
      [dbOrg({ slug: 'charmed', name: 'Charmed', description: 'Published org.', logoUrl: '/images/charmed.png' })],
      [
        { slug: 'charmed', name: 'Charmed Dungeon', excerpt: 'Should lose.', logo: '/images/other.png' },
        { slug: 'harbor-dungeon-test', name: 'Harbor Test', excerpt: 'Skip me.', logo: '/images/test.png' },
        { slug: 'baltimore-playhouse', name: 'Baltimore Playhouse', excerpt: 'Largest play space.', logo: '/images/BPH.PNG' },
      ],
      [{ slug: 'charmed', name: 'Charmed Weekend', excerpt: '**Hybrid convention.**' }],
    )

    assert.equal(merged.some((row) => row.slug === 'harbor-dungeon-test'), false)
    const charmed = merged.find((row) => row.slug === 'charmed')
    assert.equal(charmed?.name, 'Charmed')
    assert.equal(charmed?.description, 'Published org.')
    assert.equal(charmed?.relatedHref, '/dungeons/charmed')
    const playhouse = merged.find((row) => row.slug === 'baltimore-playhouse')
    assert.equal(playhouse?.relatedHref, '/dungeons/baltimore-playhouse')
    assert.equal(playhouse?.logoUrl, '/images/BPH.PNG')
  })

  it('uses dungeon slugs first, then convention slugs, and thickens conventions', () => {
    const orgs = mergeOrganizationCatalog(
      [],
      [{ slug: 'the-korral', name: 'The Korral', excerpt: 'York dungeon.', logo: '/images/korral.png' }],
      [
        { slug: 'the-korral', name: 'Korral Weekend', excerpt: 'Slug already claimed.' },
        { slug: 'primal-arts-festival', name: 'Primal Arts Fest', excerpt: '**Hybrid convention.**', logo: '/images/paf.png' },
      ],
    )
    assert.equal(orgs.find((row) => row.slug === 'the-korral')?.relatedHref, '/dungeons/the-korral')
    assert.equal(orgs.find((row) => row.slug === 'primal-arts-festival')?.relatedHref, '/events/primal-arts-festival')

    const conventions = mergeConventionCatalog(
      [dbOrg({ slug: 'charmed', name: 'Charmed', description: '**Hybrid convention.**', logoUrl: '/images/charmed.png' })],
      [
        { slug: 'charmed', name: 'Charmed Duplicate', excerpt: 'DB wins.' },
        { slug: 'dark-odyssey-winter-fire', name: 'Dark Odyssey Winter Fire', excerpt: 'Hotel weekend.', logo: '/images/do.png' },
      ],
    )
    assert.equal(conventions.find((row) => row.slug === 'charmed')?.name, 'Charmed')
    assert.equal(conventions.some((row) => row.slug === 'dark-odyssey-winter-fire'), true)
  })

  it('keeps listed dungeons without media and skips hollow unlisted stubs', () => {
    const bareDungeon = dungeonToOrgListing({ slug: 'quiet-club', name: 'Quiet Club' })
    assert.equal(bareDungeon.logoUrl, null)
    assert.equal(shouldIncludeCatalogListing({ ...bareDungeon, alreadyListed: true }), true)
    assert.equal(
      shouldIncludeCatalogListing({ logoUrl: null, description: null, alreadyListed: false }),
      false,
    )
    assert.equal(usableListingImageUrl(''), null)
    assert.equal(usableListingImageUrl('/images/BPH.PNG'), '/images/BPH.PNG')
    assert.equal(listingImageAlt('Charmed'), 'Charmed logo')
    assert.equal(isRedundantOrgDisplayName('Charmed', 'Charmed'), true)
    assert.equal(isRedundantOrgDisplayName('Charmed Productions', 'Charmed'), false)
    assert.equal(conventionToListing({ slug: 'paf', name: 'PAF', excerpt: 'Camp.' }).relatedHref, '/events/paf')
  })
})
