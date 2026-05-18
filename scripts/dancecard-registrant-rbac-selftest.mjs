/**
 * Mirrors organizerRoles + mapOrganizerRegistrantRow visibility rules (Phase 4 vetting RBAC).
 * Run: npm run test:dancecard-registrant-rbac
 */

function organizerRoleCanSeeRegistrantInternalNotes(role) {
  return role !== 'viewer' && role !== 'safety'
}

function organizerRoleCanEditVettingSafetyNotes(role) {
  return role === 'owner' || role === 'admin' || role === 'safety'
}

function mapRow(role) {
  const showInternal = organizerRoleCanSeeRegistrantInternalNotes(role)
  const showSafety = organizerRoleCanEditVettingSafetyNotes(role)
  return {
    internalNotes: showInternal ? 'internal' : null,
    vettingSafetyNotes: showSafety ? 'safety secret' : null,
  }
}

function run() {
  const viewer = mapRow('viewer')
  if (viewer.internalNotes !== null) throw new Error('viewer must not see internalNotes')
  if (viewer.vettingSafetyNotes !== null) throw new Error('viewer must not see vettingSafetyNotes')

  const editor = mapRow('editor')
  if (editor.internalNotes === null) throw new Error('editor must see internalNotes')
  if (editor.vettingSafetyNotes !== null) throw new Error('editor must not see vettingSafetyNotes')

  const safety = mapRow('safety')
  if (safety.internalNotes !== null) throw new Error('safety must not see internalNotes')
  if (safety.vettingSafetyNotes !== 'safety secret') throw new Error('safety must see vettingSafetyNotes')

  const owner = mapRow('owner')
  if (owner.internalNotes === null || owner.vettingSafetyNotes === null) {
    throw new Error('owner must see internal + vetting safety notes')
  }
}

run()
console.log('OK registrant RBAC self-test')
