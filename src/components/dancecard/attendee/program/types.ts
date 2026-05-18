/** Program slot shape used in attendee program tab (matches schedule API). */
export type ProgramSlot = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  track: string | null
  trackId?: string | null
  trackDisplay?: string | null
  room: string | null
  locationId?: string | null
  locationName?: string | null
  description: string | null
  sortOrder: number
  tagNames?: string[]
  presenters?: { sceneName: string; role: string }[]
  photoPolicy?: 'allowed' | 'restricted' | 'none'
}
