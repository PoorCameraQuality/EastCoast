import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { getKinkSocialJoinUrl, getKinkSocialOrgUrl, KINK_SOCIAL_LABELS } from '@/lib/kinkSocialMarketing'

export default function EventsPlanningStrip() {
  return (
    <aside className="events-planning-strip" aria-label="Plan on kink.social">
      <div className="events-planning-strip-inner">
        <div>
          <h2 className="events-planning-title">Make this calendar yours.</h2>
          <p className="events-planning-body">
            Save events, follow organizers, and build your Dancecard on kink.social.
          </p>
        </div>
        <div className="events-planning-actions">
          <KinkSocialCtaLink
            href={getKinkSocialJoinUrl('events_index')}
            label={KINK_SOCIAL_LABELS.joinFree}
            variant="home"
            surface="events_planning_strip"
            className="sf-btn-rose"
            external
          />
          <KinkSocialCtaLink
            href={getKinkSocialOrgUrl('organizer')}
            label={KINK_SOCIAL_LABELS.createOrg}
            variant="organizer"
            surface="events_planning_strip"
            className="sf-btn-primary"
            external
          />
        </div>
      </div>
    </aside>
  )
}
