import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildWhyGoPoints, parseEventDescription } from './eventPageContent'

describe('parseEventDescription', () => {
  it('keeps Dark Odyssey inline bold as one overview, not fragment cards', () => {
    const long = [
      'Dark Odyssey **Summer Camp** is the **Maryland** Labor Day week outdoor festival at Dark Odyssey\'s Northern Maryland retreat—not to be confused with **Camp Thornwood** in California.',
      '',
      '**ECKE dates (Sep 1-7, 2026)** align with **Labor Day 2026** (Monday Sep 7). As of **June 2026**, **darkodyssey.com/summerfest** still headlines **2025** dates; treat **2026** as **pending official confirmation** before booking travel.',
      '',
      'Expect workshops, massive indoor/outdoor dungeons, meal plans, cabins/tenting, rituals, and special events in an inclusive Sex+Kink+Spirit environment.',
    ].join('\n')

    const parsed = parseEventDescription(long)
    assert.equal(parsed.sections.length, 0)
    assert.match(parsed.intro, /Camp Thornwood/)
    assert.match(parsed.intro, /Expect workshops/)
  })

  it('still splits structured catalog headers and feature rows', () => {
    const long = [
      'Intro paragraph about the weekend.',
      '',
      '**Event Highlights:**',
      '',
      '**VendorMart** - 118-booth marketplace in the Regency Ballroom.',
      '',
      '**Skills & Education** - 150+ classes and workshops across a wide range of interests.',
    ].join('\n')

    const parsed = parseEventDescription(long)
    assert.equal(parsed.intro, 'Intro paragraph about the weekend.')
    assert.equal(parsed.sections.length, 2)
    assert.equal(parsed.sections[0]!.title, 'VendorMart')
    assert.match(parsed.sections[0]!.body, /118-booth/)
    assert.equal(parsed.sections[1]!.title, 'Skills & Education')
  })

  it('leaves plain SMIRC overview as a single intro block', () => {
    const long =
      'Join Us for 2 Days of Classes and Fun at the Summer Michigan Rope Conference!\n\nWhat to Expect:\n\nClasses and Workshops: Attend a variety of classes.'
    const parsed = parseEventDescription(long)
    assert.equal(parsed.sections.length, 0)
    assert.match(parsed.intro, /What to Expect/)
  })
})

describe('buildWhyGoPoints', () => {
  it('prefers organizer Why go lines over features', () => {
    const points = buildWhyGoPoints({
      name: 'Test',
      slug: 'test',
      date: { start: '2027-05-05', end: '2027-05-09', display: 'May 5-9, 2027' },
      location: { city: 'Darlington', state: 'MD', region: '' },
      category: 'Convention',
      excerpt: 'Fallback sentence one. Fallback sentence two.',
      website: 'https://example.com',
      features: ['Old highlight that should not win'],
      whyGo: ['Fire and ritual', 'Maryland campground'],
    })
    assert.deepEqual(points, ['Fire and ritual', 'Maryland campground'])
  })
})
