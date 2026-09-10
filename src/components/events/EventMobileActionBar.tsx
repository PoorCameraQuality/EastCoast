'use client'

import { useCallback, useState } from 'react'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'
import { ECKE_DISCORD_INVITE_URL } from '@/lib/eckeCommunity'
import type { EventPageRecord } from '@/lib/unifiedEvents'

type Props = {
  event: EventPageRecord
}

export default function EventMobileActionBar({ event }: Props) {
  const [shared, setShared] = useState(false)

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
    <div className="event-mobile-bar" role="toolbar" aria-label="Quick event actions">
      <button type="button" onClick={share} className="event-mobile-bar-btn event-mobile-bar-btn-rose">
        {shared ? 'Copied' : 'Share'}
      </button>
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
      <a
        href={ECKE_DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="event-mobile-bar-btn"
      >
        Discord
      </a>
    </div>
  )
}
