/**
 * Map Eventbrite Order API attendee payload (subset) to Dancecard registrant import row.
 * Adjust field paths to match your Eventbrite webhook / polling JSON.
 */
export function eventbriteAttendeeToImportRow(payload: Record<string, unknown>): {
  sceneDisplayName: string
  categoryName?: string
  categoryId?: string
  email?: string
  legalName?: string | null
  externalSource: string
  externalId: string
} {
  const profile = (payload.profile as Record<string, unknown>) ?? {}
  const first = String(profile.first_name ?? '').trim()
  const last = String(profile.last_name ?? '').trim()
  const email = String(profile.email ?? '').trim()
  const id = String(payload.id ?? payload.attendee_id ?? '').trim()
  if (!id) throw new Error('Eventbrite payload missing attendee id')
  const name = [first, last].filter(Boolean).join(' ') || email || 'Attendee'
  const ticketClass =
    String(payload.ticket_class_name ?? '').trim() ||
    String((payload.ticket_class as Record<string, unknown> | undefined)?.name ?? '').trim()
  return {
    sceneDisplayName: name,
    categoryName: ticketClass || undefined,
    email: email || undefined,
    legalName: last ? `${first} ${last}`.trim() : first || null,
    externalSource: 'eventbrite',
    externalId: id,
  }
}
