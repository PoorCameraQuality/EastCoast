import PlaceEventCalendar from '@/components/places/PlaceEventCalendar'
import PlaceUpcomingNights from '@/components/places/PlaceUpcomingNights'
import { startOfToday, parseLocalDate } from '@/lib/calendarVisual'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  events: PublicEventIndexItem[]
}

export default function PlaceEventsHere({ place, events }: Props) {
  const today = startOfToday()
  const upcoming = events
    .filter((event) => parseLocalDate(event.endsAt) >= today)
    .sort((a, b) => parseLocalDate(a.startsAt).getTime() - parseLocalDate(b.startsAt).getTime())

  return (
    <section id="events-here" className="place-events-here" aria-labelledby="place-events-heading">
      <div className="place-events-intro">
        <h2 id="place-events-heading" className="place-section-title">
          {`Upcoming at ${place.name}`}
        </h2>
        <p className="place-events-lede">
          {upcoming.length
            ? `${upcoming.length} public night${upcoming.length === 1 ? '' : 's'} on the calendar.`
            : "What's happening at this location."}
        </p>
      </div>

      <div className="place-events-body">
        <PlaceEventCalendar placeName={place.name} events={events} />
        {upcoming.length > 0 ? (
          <PlaceUpcomingNights events={upcoming} />
        ) : (
          <p className="place-events-empty">No public nights listed yet.</p>
        )}
      </div>
    </section>
  )
}
