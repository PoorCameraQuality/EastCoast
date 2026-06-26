'use client'

import AdaptiveEventMedia from '@/components/storefront/AdaptiveEventMedia'
import type { EventMedia } from '@/lib/eventMedia'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { eventBrandStyle } from '@/lib/eventBrandTheme'
import type { EventPageRecord } from '@/lib/unifiedEvents'

type Props = {
  event: EventPageRecord
  media: EventMedia
  brand: EventBrandTheme
}

export default function EventBrandMasthead({ event, media, brand }: Props) {
  const style = eventBrandStyle(brand)

  return (
    <div className="event-masthead" style={style} data-treatment={brand.treatment}>
      <div className="event-masthead-media">
        <AdaptiveEventMedia media={media} brand={brand} size="showcase" priority />
        <div className="event-masthead-scrim" aria-hidden />
      </div>

      <div className="event-masthead-content">
        <p className="event-masthead-type">{event.category}</p>
        <h1 className="event-masthead-title">{event.name}</h1>
        {event.excerpt ? <p className="event-masthead-pitch">{event.excerpt}</p> : null}
        <div className="event-masthead-pills">
          <span className="event-date-pill">{event.date.display}</span>
          <span className="event-masthead-pill">
            {event.location.city}, {event.location.state}
          </span>
          {event.location.region ? (
            <span className="event-masthead-pill event-masthead-pill-muted">{event.location.region}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
