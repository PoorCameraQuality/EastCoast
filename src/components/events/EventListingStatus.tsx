import { eventListingSourceLabel } from '@/lib/eventPageContent'
import type { EventPageRecord } from '@/lib/unifiedEvents'

export default function EventListingStatus({ event }: { event: EventPageRecord }) {
  return (
    <aside className="event-listing-status" aria-label="Public listing status">
      <span className="event-listing-status-badge">Public listing</span>
      <p className="event-listing-status-text">
        {eventListingSourceLabel(event)}. Confirm registration, rules, and policies on the official site.
      </p>
    </aside>
  )
}
