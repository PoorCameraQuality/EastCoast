import EckeLink from '@/components/EckeLink'
import AdaptiveEventCard from '@/components/storefront/AdaptiveEventCard'
import type { StorefrontEvent } from '@/lib/homepageStorefrontData'

type Props = {
  events: StorefrontEvent[]
}

export default function FeaturedEventRunway({ events }: Props) {
  if (events.length === 0) {
    return (
      <section className="sf-section" aria-labelledby="event-runway-title">
        <div className="container-custom">
          <h2 id="event-runway-title" className="sf-title">
            Upcoming events
          </h2>
          <p className="sf-subhead">No upcoming events right now.</p>
          <EckeLink href="/events" className="sf-btn-primary mt-5 inline-flex min-h-11">
            Browse events
          </EckeLink>
        </div>
      </section>
    )
  }

  const gridEvents = events.slice(0, 6)

  return (
    <section className="sf-section" aria-labelledby="event-runway-title">
      <div className="container-custom">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-8">
          <div>
            <h2 id="event-runway-title" className="sf-title">
              Upcoming events
            </h2>
            <p className="sf-subhead">What&apos;s live on the calendar right now.</p>
          </div>
          <EckeLink href="/events" className="inline-flex min-h-11 items-center text-sm font-medium text-sf-blue hover:text-sf-strong">
            See all events →
          </EckeLink>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gridEvents.map((event, i) => (
            <AdaptiveEventCard
              key={event.slug}
              event={event}
              size="rail"
              itemListName="home_event_rail"
              priority={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
