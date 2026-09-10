'use client'

import { useCallback, useState } from 'react'
import EventCalendarExport from '@/components/EventCalendarExport'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { eventListingSourceLabel } from '@/lib/eventPageContent'
import { ECKE_DISCORD_INVITE_URL, ECKE_DISCORD_LABEL } from '@/lib/eckeCommunity'
import type { EventPageRecord } from '@/lib/unifiedEvents'
import {
  currentTicketTier,
  formatTierDates,
  ticketSalesClosed,
} from '@/lib/eckeOrgEventShared'

type Props = {
  event: EventPageRecord
}

export default function EventActionDock({ event }: Props) {
  const [shared, setShared] = useState(false)
  const salesClosed = ticketSalesClosed(event.registrationDeadline)
  const liveTier = currentTicketTier(event.ticketTiers || [])
  const tiers = event.ticketTiers || []

  const share = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: event.name, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {
      /* user cancelled */
    }
  }, [event.name])

  return (
    <aside className="event-action-dock" aria-label="Event actions">
      <div className="event-action-dock-panel">
        <p className="event-action-dock-eyebrow">Public listing</p>
        <h2 className="event-action-dock-heading">Attend this event</h2>
        <p className="event-action-dock-body">
          Confirm times, tickets, and house rules with the organizer before you go.
        </p>

        <div className="event-action-dock-actions">
          {event.website ? (
            <OutboundWebsiteLink
              href={event.website}
              entityType="event"
              entitySlug={event.slug}
              entityName={event.name}
              organizerName={event.organizer}
              className="ed-btn-official w-full"
            >
              Visit official site
            </OutboundWebsiteLink>
          ) : null}

          {!salesClosed && event.ticketUrl && event.ticketUrl !== event.website ? (
            <OutboundWebsiteLink
              href={event.ticketUrl}
              entityType="event"
              entitySlug={event.slug}
              entityName={event.name}
              organizerName={event.organizer}
              className="ed-btn-ghost w-full"
            >
              Tickets / registration
            </OutboundWebsiteLink>
          ) : null}

          <button type="button" onClick={share} className="ed-btn-ghost w-full">
            {shared ? 'Link copied' : 'Share event'}
          </button>

          <a
            href={ECKE_DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-btn-ghost w-full"
          >
            {ECKE_DISCORD_LABEL}
          </a>
        </div>

        <dl className="event-action-dock-facts">
          <div>
            <dt>When</dt>
            <dd>{event.date.display}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {event.location.city}, {event.location.state}
              {event.location.region &&
              event.location.region.trim().toLowerCase() !==
                `${event.location.city}, ${event.location.state}`.trim().toLowerCase() ? (
                <span className="event-action-dock-fact-sub">{event.location.region}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{event.category}</dd>
          </div>
          {event.organizer ? (
            <div>
              <dt>Organizer</dt>
              <dd>{event.organizer}</dd>
            </div>
          ) : null}
          {salesClosed ? (
            <div>
              <dt>Tickets</dt>
              <dd>Sales closed</dd>
            </div>
          ) : liveTier ? (
            <div>
              <dt>Tickets now</dt>
              <dd>
                {liveTier.price}
                {liveTier.label ? ` · ${liveTier.label}` : ''}
              </dd>
            </div>
          ) : event.ticketPrice ? (
            <div>
              <dt>Tickets</dt>
              <dd>{event.ticketPrice}</dd>
            </div>
          ) : null}
          {event.registrationDeadline && !salesClosed ? (
            <div>
              <dt>Sales close</dt>
              <dd>{new Date(`${event.registrationDeadline}T00:00:00`).toLocaleDateString()}</dd>
            </div>
          ) : null}
        </dl>
        {tiers.length > 1 ? (
          <ol className="mt-3 space-y-1 text-xs text-sf-muted">
            {tiers.map((tier, index) => (
              <li key={`${tier.startsOn}-${index}`}>
                {tier.label ? `${tier.label}: ` : ''}
                {tier.price} · {formatTierDates(tier)}
              </li>
            ))}
          </ol>
        ) : null}

        <p className="event-action-dock-source">{eventListingSourceLabel(event)}</p>
      </div>

      <EventCalendarExport event={event} variant="eventDock" />
    </aside>
  )
}
