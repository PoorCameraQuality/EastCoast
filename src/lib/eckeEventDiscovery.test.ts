import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { eventDiscoveryPaths } from './eckeEventDiscoveryShared'
import { buildEventSeoKeywords, buildEventSeoTitle, slugifyEventSlug } from './eckeOrgEventShared'

describe('event discovery SEO helpers', () => {
  it('pings the event plus index and state hub only', () => {
    assert.deepEqual(eventDiscoveryPaths('harbor-munch-test', 'PA'), [
      '/events/harbor-munch-test',
      '/events',
      '/calendar',
      '/states',
      '/states/pennsylvania',
    ])
  })

  it('skips a state hub when the event is online / has no abbr', () => {
    assert.deepEqual(eventDiscoveryPaths('online-munch', 'US'), [
      '/events/online-munch',
      '/events',
      '/calendar',
      '/states',
    ])
  })

  it('builds a short keyword list from title, place, and kind', () => {
    assert.deepEqual(
      buildEventSeoKeywords({
        title: 'Harbor Munch Test',
        city: 'Harrisburg',
        state: 'pa',
        kind: 'munch',
      }),
      ['Harbor Munch Test', 'Harrisburg', 'PA', 'Munch', 'kink events', 'BDSM'],
    )
    assert.equal(
      buildEventSeoTitle({
        title: 'Harbor Munch Test',
        city: 'Harrisburg',
        state: 'PA',
        startDate: '2026-10-12',
      }),
      'Harbor Munch Test — Harrisburg, PA (2026)',
    )
    assert.equal(slugifyEventSlug('My Event 2027'), 'my-event-2027')
  })
})
