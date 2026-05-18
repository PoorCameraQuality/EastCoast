export type PublicDancecardEvent = {
  slug: string
  eventTitle: string
  timezone: string
  startsAt: string
  endsAt: string
}

export type PublicDancecardEventsResponse = {
  events: PublicDancecardEvent[]
}
