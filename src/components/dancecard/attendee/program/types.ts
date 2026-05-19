/** Program slot shape used in attendee program tab (matches schedule API). */

export type ProgramPresenter = {

  personId?: string

  sceneName: string

  role: string

  publicBio?: string | null

  photoUrl?: string | null

}



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

  presenters?: ProgramPresenter[]

  photoPolicy?: 'allowed' | 'restricted' | 'none'

}

