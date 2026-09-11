import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hubCountLabel } from './usStateMapCounts'

describe('hubCountLabel', () => {
  it('uses existing event and place counts only', () => {
    assert.equal(
      hubCountLabel({ events: 2, conventions: 1, places: 4 }),
      '3 upcoming, 4 places'
    )
    assert.equal(
      hubCountLabel({ events: 0, conventions: 0, places: 0 }),
      'Growing hub'
    )
  })
})
