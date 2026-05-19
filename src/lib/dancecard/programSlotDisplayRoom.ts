/** Canonical room label for attendee-facing program UI (matches organizer programSlotRoomLabel). */
export function programSlotDisplayRoom(slot: {
  room?: string | null
  locationName?: string | null
}): string {
  const fromLocation = (slot.locationName ?? '').trim()
  if (fromLocation) return fromLocation
  return (slot.room ?? '').trim()
}
