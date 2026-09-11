import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { EAST_COAST_STATES } from './eastCoastStates'
import { usMapAbbrToSlug, usMapPathAbbrs } from './usStateMapIndex'

describe('us state index map data', () => {
  it('maps every SVG path abbreviation to a live hub slug', () => {
    const byAbbr = usMapAbbrToSlug()
    for (const abbr of usMapPathAbbrs()) {
      assert.ok(byAbbr.has(abbr), `missing hub slug for ${abbr}`)
    }
  })

  it('includes every non-Canada catalog state on the map', () => {
    const pathAbbrs = new Set(usMapPathAbbrs())
    for (const info of Object.values(EAST_COAST_STATES)) {
      if (info.region === 'Canada') continue
      assert.ok(pathAbbrs.has(info.abbr), `map is missing ${info.abbr}`)
    }
  })

})
