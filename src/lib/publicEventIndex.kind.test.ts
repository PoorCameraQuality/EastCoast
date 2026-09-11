import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { UnifiedEvent } from '@/lib/unifiedEvents'
import {
  eventSlugFromInternalHref,
  featuredScore,
  isNationalConventionListing,
  matchesIntent,
  pickUpcomingConventionRail,
  unifiedToIndexItem,
} from './publicEventIndex'

function event(partial: Partial<UnifiedEvent> & Pick<UnifiedEvent, 'slug' | 'name'>): UnifiedEvent {
  return {
    name: partial.name,
    slug: partial.slug,
    date: partial.date ?? { start: '2026-10-02', end: '2026-10-02', display: 'Oct 2, 2026' },
    location: partial.location ?? { city: 'Spring Grove', state: 'PA', region: 'Pennsylvania' },
    excerpt: partial.excerpt ?? 'A night at the club.',
    category: partial.category ?? 'Play party',
    tagSlugs: partial.tagSlugs ?? [],
    source: partial.source ?? 'supabase',
    eventKind: partial.eventKind,
    dungeonSlug: partial.dungeonSlug,
    dungeonVenueId: partial.dungeonVenueId,
    featured: partial.featured,
  }
}

describe('national convention vs local nights', () => {
  it('keeps venue-linked Korral nights off the national convention feed', () => {
    const item = unifiedToIndexItem(
      event({
        slug: 'korral-1185-fresh-meat-friday',
        name: 'Fresh Meat Friday',
        eventKind: 'play_party',
        dungeonSlug: 'the-korral',
        dungeonVenueId: '54c4bb53-3058-4a01-b909-e73fcb4eba79',
      }),
    )
    assert.equal(item.listingKind, 'event')
    assert.equal(isNationalConventionListing(item), false)
    assert.equal(matchesIntent(item, 'conventions'), false)
    assert.equal(matchesIntent(item, 'all'), false)
    assert.equal(matchesIntent(item, 'local'), true)
  })

  it('keeps a multi-day play party on a dungeon calendar local', () => {
    const item = unifiedToIndexItem(
      event({
        slug: 'korral-1201-anniversary',
        name: '12th Year Anniversary Party',
        eventKind: 'play_party',
        dungeonSlug: 'the-korral',
        date: { start: '2026-10-09', end: '2026-10-11', display: 'Oct 9-11, 2026' },
      }),
    )
    assert.equal(isNationalConventionListing(item), false)
    assert.equal(matchesIntent(item, 'all'), false)
    assert.equal(matchesIntent(item, 'local'), true)
  })

  it('keeps multi-day catalog gatherings on the national convention feed', () => {
    const item = unifiedToIndexItem(
      event({
        slug: 'primal-arts-festival',
        name: 'Primal Arts Fest',
        category: 'Outdoor Event',
        excerpt: 'PAF27 returns May 5–9, 2027.',
        date: { start: '2027-05-05', end: '2027-05-09', display: 'May 5-9, 2027' },
        location: { city: 'Darlington', state: 'MD', region: 'Maryland' },
        source: 'static',
      }),
    )
    assert.equal(item.listingKind, 'convention')
    assert.equal(isNationalConventionListing(item), true)
    assert.equal(matchesIntent(item, 'conventions'), true)
    assert.equal(matchesIntent(item, 'all'), true)
    assert.equal(matchesIntent(item, 'local'), false)
  })

  it('does not promote a one-day social to the national convention rail', () => {
    const item = unifiedToIndexItem(
      event({
        slug: 'harbor-munch-test',
        name: 'Harbor Munch',
        eventKind: 'munch',
        category: 'Munch',
      }),
    )
    assert.equal(isNationalConventionListing(item), false)
    assert.equal(matchesIntent(item, 'all'), false)
    assert.equal(matchesIntent(item, 'local'), true)
  })

  it('pins catalog featured flags above other convention scoring', () => {
    const featured = unifiedToIndexItem(
      event({
        slug: 'grand-strand-affair-2026',
        name: 'Grand Strand Affair 2026',
        category: 'Convention',
        featured: true,
        date: { start: '2026-11-19', end: '2026-11-22', display: 'Nov 19–22, 2026' },
        location: { city: 'Myrtle Beach', state: 'SC', region: 'South Carolina' },
      }),
    )
    const other = unifiedToIndexItem(
      event({
        slug: 'other-con',
        name: 'Other Con',
        category: 'Convention',
        date: { start: '2026-10-01', end: '2026-10-04', display: 'Oct 1–4, 2026' },
      }),
    )
    assert.equal(featured.featured, true)
    assert.equal(featured.listingKind, 'convention')
    assert.equal(isNationalConventionListing(featured), true)
    assert.equal(featuredScore(featured) > featuredScore(other), true)
    assert.equal(eventSlugFromInternalHref('/events/grand-strand-affair-2026'), 'grand-strand-affair-2026')
    const rail = pickUpcomingConventionRail(
      [
        { slug: 'earlier-con', featured: false },
        { slug: 'another-con', featured: false },
        { slug: 'grand-strand-affair-2026', featured: true },
      ],
      { sponsorSlug: 'grand-strand-affair-2026', limit: 2 },
    )
    assert.equal(rail[0]?.slug, 'grand-strand-affair-2026')
    assert.equal(rail.length, 2)
  })
})
