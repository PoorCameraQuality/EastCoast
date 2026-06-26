import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  events: PublicEventIndexItem[]
}

export default function PlaceEventsHere({ place, events }: Props) {
  return (
    <section id="events-here" className="place-events-here" aria-labelledby="place-events-heading">
      <h2 id="place-events-heading" className="place-section-title">
        Upcoming at {place.name}
      </h2>

      {events.length === 0 ? (
        <div className="place-events-empty">
          <p>No public events listed here yet.</p>
          <KinkSocialCtaLink
            href={buildKinkSocialUrl(KINK_SOCIAL_PATHS.orgNew, 'organizer', {
              ref: 'ecke_place_publish',
              ecke_place: place.slug,
            })}
            label="Publish events from kink.social"
            variant="organizer"
            surface="place_events_empty"
            className="place-btn place-btn-save"
            external
          />
        </div>
      ) : (
        <ul className="place-events-list">
          {events.map((event) => (
            <li key={event.slug}>
              <EckeLink href={`/events/${event.slug}`} className="place-event-row">
                <span className="place-event-date">{event.dateDisplay}</span>
                <span className="place-event-title">{event.title}</span>
                <span className="place-event-location">
                  {event.city}, {event.state}
                </span>
              </EckeLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
