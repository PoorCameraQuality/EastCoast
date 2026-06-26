import EckeLink from '@/components/EckeLink'
import CalendarEventRow from '@/components/calendar/CalendarEventRow'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type Props = {
  events: PublicEventIndexItem[]
  conventions: PublicEventIndexItem[]
  stateName: string
  stateSlug: string
}

export default function StateEventRunway({ events, conventions, stateName, stateSlug }: Props) {
  const featured = conventions[0] ?? events[0]
  const rest = [...conventions.slice(featured && conventions[0] === featured ? 1 : 0), ...events]
    .filter((e) => e.slug !== featured?.slug)
    .slice(0, 4)

  if (!featured && rest.length === 0) {
    return (
      <section className="st-section" aria-labelledby="st-events">
        <h2 id="st-events" className="st-section-title">
          Upcoming events in {stateName}
        </h2>
        <div className="st-empty">
          No upcoming events listed for {stateName} yet.{' '}
          <EckeLink href="/events" className="text-violet-300 underline">
            Browse all events
          </EckeLink>
        </div>
      </section>
    )
  }

  return (
    <section className="st-section" aria-labelledby="st-events">
      <div className="st-section-head">
        <h2 id="st-events" className="st-section-title">
          Upcoming events &amp; conventions
        </h2>
        <EckeLink href={`/bdsm-events/${stateSlug}`} className="st-btn-violet">
          All {stateName} events
        </EckeLink>
      </div>
      {featured ? (
        <EckeLink href={`/events/${featured.slug}`} className="st-featured-event block mb-3">
          <p className="st-featured-event-label">
            {featured.listingKind === 'convention' ? 'Featured convention' : 'Featured event'}
          </p>
          <p className="st-featured-event-title">{featured.title}</p>
          <p className="st-listing-meta mt-1">
            {featured.dateDisplay} · {featured.city}, {featured.state}
          </p>
        </EckeLink>
      ) : null}
      <div className="st-event-runway">
        {rest.map((item) => (
          <CalendarEventRow key={item.slug} item={item} />
        ))}
      </div>
    </section>
  )
}
