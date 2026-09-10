import EckeLink from '@/components/EckeLink'
import OrgDashboardEventRow from '@/components/org/dashboard/OrgDashboardEventRow'
import { DASHBOARD_EVENT_LIMIT, sortDashboardEvents } from '@/components/org/dashboard/dashboardListing'
import type { ManagedEventRow } from '@/lib/eckeOrgEventShared'

export default function OrgDashboardEvents({
  events,
  placeName,
}: {
  events: ManagedEventRow[]
  placeName?: string
}) {
  const ranked = sortDashboardEvents(events)
  const visible = ranked.slice(0, DASHBOARD_EVENT_LIMIT)
  const hiddenCount = Math.max(0, ranked.length - visible.length)

  return (
    <section className="org-dashboard-section" aria-labelledby="org-dashboard-events-heading">
      <div className="org-dashboard-section-head">
        <h2 id="org-dashboard-events-heading" className="org-dashboard-section-title">
          Events
        </h2>
        <EckeLink href="/events/my-events" className="org-dashboard-text-link">
          All events
        </EckeLink>
      </div>
      <p className="org-dashboard-section-note">
        Drafts and upcoming first.
        {placeName ? (
          <>
            {' '}
            <EckeLink href="/events/create?at=place" className="org-dashboard-inline-link">
              Add a night at {placeName}
            </EckeLink>
          </>
        ) : null}
      </p>

      {visible.length === 0 ? (
        <p className="org-dashboard-empty">
          No events yet.{' '}
          <EckeLink href="/events/create" className="org-dashboard-inline-link">
            Create your first event
          </EckeLink>
        </p>
      ) : (
        <>
          <div className="org-event-cols" aria-hidden="true">
            <span>Event</span>
            <span>Date</span>
            <span>Location</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div>
            {visible.map((event) => (
              <OrgDashboardEventRow key={event.id} event={event} />
            ))}
          </div>
          {hiddenCount > 0 ? (
            <p className="org-dashboard-section-note">
              {hiddenCount} more on{' '}
              <EckeLink href="/events/my-events" className="org-dashboard-inline-link">
                All events
              </EckeLink>
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
