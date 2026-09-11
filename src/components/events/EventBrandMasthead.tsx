'use client'

import AdaptiveEventMedia from '@/components/storefront/AdaptiveEventMedia'
import type { EventMedia } from '@/lib/eventMedia'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { eventBrandStyle } from '@/lib/eventBrandTheme'
import type { EventPageRecord } from '@/lib/unifiedEvents'
import { openEventApplications } from '@/lib/eckeOrgEventAssets'
import { isSiteSponsorEventSlug } from '@/data/siteSponsor'

type Props = {
  event: EventPageRecord
  media: EventMedia
  brand: EventBrandTheme
}

export default function EventBrandMasthead({ event, media, brand }: Props) {
  const style = eventBrandStyle(brand)
  const applications = openEventApplications(event)
  const isSiteSponsor = isSiteSponsorEventSlug(event.slug)

  return (
    <div className="event-masthead" style={style} data-treatment={brand.treatment}>
      <div className="event-masthead-media">
        <AdaptiveEventMedia media={media} brand={brand} size="showcase" priority />
        <div className="event-masthead-scrim" aria-hidden />
      </div>

      <div className="event-masthead-content">
        {applications.length ? (
          <div className="event-application-pips" aria-label="Open applications">
            {applications.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="event-application-pip">
                <span className="event-application-pip-dot" aria-hidden />
                {item.label} applications open
              </a>
            ))}
          </div>
        ) : null}
        {isSiteSponsor ? (
          <p className="event-masthead-sponsor">
            <span className="event-masthead-sponsor-badge">Site sponsor</span>
            <span className="event-masthead-sponsor-note">Supporting East Coast Kink Events</span>
          </p>
        ) : null}
        <p className="event-masthead-type">{event.category}</p>
        <h1 className="event-masthead-title">{event.name}</h1>
        {event.excerpt ? <p className="event-masthead-pitch">{event.excerpt}</p> : null}
        <div className="event-masthead-pills">
          <span className="event-date-pill">{event.date.display}</span>
          <span className="event-masthead-pill">
            {event.location.city}, {event.location.state}
          </span>
          {event.location.region &&
          event.location.region.trim().toLowerCase() !==
            `${event.location.city}, ${event.location.state}`.trim().toLowerCase() ? (
            <span className="event-masthead-pill event-masthead-pill-muted">{event.location.region}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
