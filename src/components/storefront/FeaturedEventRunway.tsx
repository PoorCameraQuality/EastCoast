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
            The latest
          </h2>
          <p className="sf-subhead">No upcoming events right now.</p>
          <EckeLink href="/events" className="sf-btn-primary mt-5 inline-flex">
            Browse events
          </EckeLink>
        </div>
      </section>
    )
  }

  const railEvents = events.length > 1 ? events.slice(1, 9) : events.slice(0, 8)

  return (
    <section className="sf-section" aria-labelledby="event-runway-title">
      <div className="container-custom">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-8">
          <div>
            <h2 id="event-runway-title" className="sf-title">
              The latest
            </h2>
            <p className="sf-subhead">Upcoming events worth planning around.</p>
          </div>
          <EckeLink href="/events" className="sf-btn-ghost shrink-0 text-sm">
            See all events →
          </EckeLink>
        </div>

        <div className="event-rail -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
          {railEvents.map((event, i) => (
            <div key={event.slug} className="flex min-w-[78%] snap-start sm:min-w-[52%] md:min-w-0 md:h-full">
              <AdaptiveEventCard
                event={event}
                size="rail"
                itemListName="home_event_rail"
                priority={i < 2}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
