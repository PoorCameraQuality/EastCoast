import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ORG_SESSION_MAX_MS,
  isOrgManagedPath,
  isOrgSessionExpired,
  parseOrgSessionStartedAt,
  safeOrgNextPath,
} from './eckeOrgSessionLimit'

describe('eckeOrgSessionLimit', () => {
  it('parses a login timestamp and expires after two hours', () => {
    const started = Date.parse('2026-09-10T00:00:00.000Z')
    assert.equal(parseOrgSessionStartedAt(String(started)), started)
    assert.equal(isOrgSessionExpired(started, started + ORG_SESSION_MAX_MS - 1), false)
    assert.equal(isOrgSessionExpired(started, started + ORG_SESSION_MAX_MS + 1), true)
  })

  it('treats organizer tools as managed paths', () => {
    assert.equal(isOrgManagedPath('/events/my-events'), true)
    assert.equal(isOrgManagedPath('/events/harbor-munch-test/manage'), true)
    assert.equal(isOrgManagedPath('/events/harbor-munch-test'), false)
    assert.equal(isOrgManagedPath('/vendors/my-shop'), true)
    assert.equal(isOrgManagedPath('/vendors/login'), false)
    assert.equal(isOrgManagedPath('/vendors/harbor-leather'), false)
    assert.equal(isOrgManagedPath('/dungeons/my-place'), true)
    assert.equal(isOrgManagedPath('/dungeons/baltimore-playhouse'), false)
    assert.equal(isOrgManagedPath('/states/pennsylvania'), false)
  })

  it('only allows known post-login destinations', () => {
    assert.equal(safeOrgNextPath('/vendors/my-shop'), '/vendors/my-shop')
    assert.equal(safeOrgNextPath('/dungeons/my-place'), '/dungeons/my-place')
    assert.equal(safeOrgNextPath('https://evil.example'), '/dashboard')
    assert.equal(safeOrgNextPath('/events/harbor-munch-test'), '/dashboard')
  })
})
