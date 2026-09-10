import EckeLink from '@/components/EckeLink'
import ListingStatusBadge from '@/components/org/dashboard/ListingStatusBadge'
import OrgDashboardEventMore from '@/components/org/dashboard/OrgDashboardEventMore'
import {
  dashboardEventStatus,
  eventLocationLabel,
  formatDashboardDate,
} from '@/components/org/dashboard/dashboardListing'
import type { ManagedEventRow } from '@/lib/eckeOrgEventShared'

export default function OrgDashboardEventRow({ event }: { event: ManagedEventRow }) {
  const status = dashboardEventStatus(event)
  const date = formatDashboardDate(event.start_date)
  const location = eventLocationLabel(event)

  return (
    <article className="org-event-row">
      <div>
        <h3 className="org-event-name">{event.title}</h3>
        <p className="org-event-meta org-event-mobile-meta">
          {date} · {location}
        </p>
      </div>
      <p className="org-event-meta org-event-desktop-cell">{date}</p>
      <p className="org-event-meta org-event-desktop-cell">{location}</p>
      <div>
        <ListingStatusBadge status={status} />
      </div>
      <div className="org-event-actions">
        <EckeLink href={`/events/${event.slug}`} className="org-dashboard-row-action">
          View
        </EckeLink>
        <EckeLink href={`/events/${event.slug}/edit`} className="org-dashboard-row-action">
          Edit
        </EckeLink>
        <OrgDashboardEventMore slug={event.slug} />
      </div>
    </article>
  )
}
