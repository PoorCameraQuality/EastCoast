import assert from 'node:assert/strict'
import { slugifyOrganizerName } from './analyticsEntities'

assert.equal(slugifyOrganizerName('Dark Odyssey'), 'dark-odyssey')
assert.equal(slugifyOrganizerName('  Studio 58 Events '), 'studio-58-events')
assert.equal(slugifyOrganizerName(''), '')
assert.equal(slugifyOrganizerName(null), '')

console.log('analyticsEntities.selftest: ok')
