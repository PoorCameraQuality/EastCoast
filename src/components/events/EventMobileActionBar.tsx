'use client'

import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { EventPageRecord } from '@/lib/unifiedEvents'

type Props = {
  event: EventPageRecord
  safeKinkSocialEventUrl: string | null
}

export default function EventMobileActionBar({ event, safeKinkSocialEventUrl }: Props) {
  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'event_detail', {
    ref: 'ecke_event_save_mobile',
    ecke_event: event.slug,
  })

  return (
    <div className="event-mobile-bar" role="toolbar" aria-label="Quick event actions">
      <KinkSocialCtaLink
        href={safeKinkSocialEventUrl ?? saveHref}
        label="Save"
        variant="home"
        surface="event_mobile_bar"
        entitySlug={event.slug}
        className="event-mobile-bar-btn event-mobile-bar-btn-rose"
        external
      />
      <a href="#event-calendar" className="event-mobile-bar-btn">
        Calendar
      </a>
      {event.website ? (
        <OutboundWebsiteLink
          href={event.website}
          entityType="event"
          entitySlug={event.slug}
          entityName={event.name}
          className="event-mobile-bar-btn"
        >
          Official site
        </OutboundWebsiteLink>
      ) : null}
    </div>
  )
}
