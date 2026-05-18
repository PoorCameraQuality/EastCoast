export type SlotPublicationFields = {
  is_published: boolean
  visibility: string
  is_frozen: boolean
}

/** Attendee-facing APIs: published slots only; staff_only visible to staff session. */
export function slotVisibleToAttendee(row: SlotPublicationFields, isStaff: boolean): boolean {
  if (!row.is_published) return false
  if (row.visibility === 'secret') return false
  if (row.visibility === 'staff_only') return isStaff
  return true
}
