import { eventListingSourceLabel } from '@/lib/eventPageContent'
import { getSiteSponsorPromo, isSiteSponsorEventSlug } from '@/data/siteSponsor'
import type { EventPageRecord } from '@/lib/unifiedEvents'

export default function EventListingStatus({ event }: { event: EventPageRecord }) {
  const isSiteSponsor = isSiteSponsorEventSlug(event.slug)
  const sponsorName = getSiteSponsorPromo()?.name

  return (
    <aside className="event-listing-status" aria-label="Public listing status">
      <span className={`event-listing-status-badge${isSiteSponsor ? ' event-listing-status-badge-sponsor' : ''}`}>
        {isSiteSponsor ? 'Site sponsor' : 'Public listing'}
      </span>
      <p className="event-listing-status-text">
        {isSiteSponsor
          ? `${sponsorName || 'This event'} supports East Coast Kink Events. Confirm registration, rules, and policies on the official site.`
          : `${eventListingSourceLabel(event)}. Confirm registration, rules, and policies on the official site.`}
      </p>
    </aside>
  )
}
