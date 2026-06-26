'use client'

import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { exportSingleEvent } from '@/lib/calendarExport'
import { calendarPillTone, isPastItem, parseLocalDate, typeBadgeLabel } from '@/lib/calendarVisual'
import { sourceLabel } from '@/lib/publicEventIndex'
import { buildKinkSocialUrl, getKinkSocialJoinUrl, getKinkSocialOrgUrl, KINK_SOCIAL_LABELS, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

type Props = {
  item: PublicEventIndexItem
}

export default function CalendarEventRow({ item }: Props) {
  const past = isPastItem(item)
  const start = parseLocalDate(item.startsAt)
  const tone = calendarPillTone(item, past)
  const src = sourceLabel(item)
  const saveHref = buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'calendar', {
    ref: 'ecke_save',
    ecke_event: item.slug,
  })

  return (
    <article className={`cal-event-row ${past ? 'cal-event-row-past' : ''}`}>
      <div className="cal-event-row-date" aria-hidden>
        <span className="cal-event-row-date-month">
          {start.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="cal-event-row-date-day">{start.getDate()}</span>
      </div>

      {item.logoUrl ? (
        <div className="cal-event-row-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.logoUrl} alt="" loading="lazy" />
        </div>
      ) : (
        <div className="cal-event-row-thumb cal-event-row-thumb-fallback" aria-hidden>
          {item.title.slice(0, 1)}
        </div>
      )}

      <div className="cal-event-row-body">
        <div className="cal-event-row-badges">
          <span className={`cal-badge ${tone.pill}`}>{typeBadgeLabel(item)}</span>
          {item.dancecardEnabled ? <span className="cal-badge cal-badge-dancecard">Dancecard</span> : null}
          {src ? (
            <span className="cal-badge cal-badge-source" title={src}>
              <span className="cal-source-dot" aria-hidden />
              kink.social
            </span>
          ) : null}
        </div>
        <EckeLink href={`/events/${item.slug}`} className="cal-event-row-title">
          {item.title}
        </EckeLink>
        <p className="cal-event-row-meta">
          {item.dateDisplay}
          <span className="cal-event-row-sep"> · </span>
          {item.city}, {item.state}
        </p>
        <div className="cal-event-row-actions">
          <EckeLink href={`/events/${item.slug}`} className="cal-btn cal-btn-view">
            View event
          </EckeLink>
          <KinkSocialCtaLink
            href={saveHref}
            label="Save on kink.social"
            variant="calendar"
            surface="calendar_row"
            className="cal-btn cal-btn-save"
            external
          />
          <details className="cal-event-row-more">
            <summary>Add to calendar</summary>
            <div className="cal-event-row-export">
              <button type="button" onClick={() => exportSingleEvent(item, 'google')}>
                Google
              </button>
              <button type="button" onClick={() => exportSingleEvent(item, 'apple')}>
                Apple
              </button>
              <button type="button" onClick={() => exportSingleEvent(item, 'ical')}>
                iCal
              </button>
            </div>
          </details>
        </div>
      </div>
    </article>
  )
}

export function CalendarPlanningCtaCompact({ showDancecardNote }: { showDancecardNote?: boolean }) {
  return (
    <aside className="cal-planning-cta" aria-label="Plan on kink.social">
      <h2 className="cal-planning-cta-title">Make this calendar yours.</h2>
      <p className="cal-planning-cta-body">
        Save events, follow organizers, and build your weekend plans on kink.social.
      </p>
      {showDancecardNote ? (
        <p className="cal-planning-cta-note">Dancecard available for supported events.</p>
      ) : null}
      <div className="cal-planning-cta-actions">
        <KinkSocialCtaLink
          href={getKinkSocialJoinUrl('calendar')}
          label={KINK_SOCIAL_LABELS.joinFree}
          variant="calendar"
          surface="calendar_planning"
          className="sf-btn-rose cal-planning-btn"
          external
        />
        <KinkSocialCtaLink
          href={getKinkSocialOrgUrl('calendar')}
          label={KINK_SOCIAL_LABELS.createOrg}
          variant="organizer"
          surface="calendar_planning"
          className="sf-btn-primary cal-planning-btn"
          external
        />
        <KinkSocialCtaLink
          href={getKinkSocialOrgUrl('calendar')}
          label="Publish your event"
          variant="organizer"
          surface="calendar_planning"
          className="cal-planning-btn cal-planning-btn-ghost"
          external
        />
      </div>
    </aside>
  )
}
