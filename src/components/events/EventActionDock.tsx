'use client'

import { useCallback, useState } from 'react'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import EventCalendarExport from '@/components/EventCalendarExport'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import {
  buildKinkSocialUrl,
  getAcquisitionCopy,
  KINK_SOCIAL_PATHS,
} from '@/lib/kinkSocialMarketing'
import { eventListingSourceLabel } from '@/lib/eventPageContent'
import type { EventPageRecord } from '@/lib/unifiedEvents'

type Props = {
  event: EventPageRecord
  safeKinkSocialEventUrl: string | null
  isC2kSourced: boolean
}

export default function EventActionDock({ event, safeKinkSocialEventUrl, isC2kSourced }: Props) {
  const [shared, setShared] = useState(false)
  const copy = getAcquisitionCopy(isC2kSourced ? 'c2kEventDetail' : 'eventDetail', {
    eventSlug: event.slug,
    safeKinkSocialEventUrl,
  })

  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'event_detail', {
    ref: 'ecke_event_save',
    ecke_event: event.slug,
  })

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
        <p className="event-action-dock-eyebrow">{copy.eyebrow}</p>
        <h2 className="event-action-dock-heading">{copy.heading}</h2>
        <p className="event-action-dock-body">{copy.body}</p>

        <div className="event-action-dock-actions">
          {event.website ? (
            <OutboundWebsiteLink
              href={event.website}
              entityType="event"
              entitySlug={event.slug}
              entityName={event.name}
              className="ed-btn-official w-full"
            >
              Visit official site
            </OutboundWebsiteLink>
          ) : null}

          <KinkSocialCtaLink
            href={safeKinkSocialEventUrl ?? saveHref}
            label="Save on kink.social"
            variant="home"
            surface="event_action_dock"
            entitySlug={event.slug}
            className="ed-btn-rose w-full"
            external
          />

          {safeKinkSocialEventUrl ? (
            <KinkSocialCtaLink
              href={safeKinkSocialEventUrl}
              label="View on kink.social"
              variant="home"
              surface="event_action_dock_follow"
              entitySlug={event.slug}
              className="ed-btn-ghost w-full"
              external
            />
          ) : null}

          <button type="button" onClick={share} className="ed-btn-ghost w-full">
            {shared ? 'Link copied' : 'Share event'}
          </button>
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
              {event.location.region ? (
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
        </dl>

        <p className="event-action-dock-source">{eventListingSourceLabel(event)}</p>
      </div>

      <EventCalendarExport event={event} variant="eventDock" />
    </aside>
  )
}
