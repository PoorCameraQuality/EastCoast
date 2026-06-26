import EckeLink from '@/components/EckeLink'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import type { EventPageRecord } from '@/lib/unifiedEvents'

export default function EventVenueTravel({ event }: { event: EventPageRecord }) {
  const stateSlug = stateAbbrToSlug(event.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : event.location.state

  return (
    <section className="event-venue" aria-labelledby="event-venue-title">
      <h2 id="event-venue-title" className="event-section-title">
        Venue &amp; travel
      </h2>
      <div className="event-venue-card">
        <p className="event-venue-primary">
          {event.location.city}, {event.location.state}
        </p>
        {event.location.region ? (
          <p className="event-venue-region">{event.location.region}</p>
        ) : null}
        {event.venue ? (
          <p className="event-venue-name">
            <span className="event-venue-label">Venue</span> {event.venue}
          </p>
        ) : (
          <p className="event-venue-privacy">
            Venue details may be shared on the official site or after registration.
          </p>
        )}
        <div className="event-venue-links">
          {stateSlug ? (
            <EckeLink href={`/states/${stateSlug}`} className="event-venue-link">
              {stateName} hub
            </EckeLink>
          ) : null}
          {stateSlug ? (
            <EckeLink href={`/bdsm-events/${stateSlug}`} className="event-venue-link">
              More events in {event.location.state}
            </EckeLink>
          ) : null}
          <EckeLink href="/dungeons" className="event-venue-link">
            Places near this event
          </EckeLink>
        </div>
      </div>
    </section>
  )
}
