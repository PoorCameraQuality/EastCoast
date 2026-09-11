import OrgAccountSecurity from '@/components/org/dashboard/OrgAccountSecurity'
import OrgDashboardEvents from '@/components/org/dashboard/OrgDashboardEvents'
import OrgDashboardHeader from '@/components/org/dashboard/OrgDashboardHeader'
import OrgDashboardOverview from '@/components/org/dashboard/OrgDashboardOverview'
import OrgDashboardPresence from '@/components/org/dashboard/OrgDashboardPresence'
import { dashboardEventStatus } from '@/components/org/dashboard/dashboardListing'
import type { ManagedPlaceRow } from '@/lib/eckeOrgDungeonShared'
import type { ManagedEventRow } from '@/lib/eckeOrgEventShared'
import type { ManagedShopRow } from '@/lib/eckeOrgVendorShared'

type Props = {
  organizationName: string
  signedInAs: string
  username: string | null
  contactEmail: string
  events: ManagedEventRow[]
  place: ManagedPlaceRow | null
  shop: ManagedShopRow | null
  productCount: number
}

export default function OrgDashboard({
  organizationName,
  signedInAs,
  username,
  contactEmail,
  events,
  place,
  shop,
  productCount,
}: Props) {
  const draftCount = events.filter((event) => dashboardEventStatus(event) === 'draft').length
  const attentionCount =
    (place && !place.contact_email ? 1 : 0) + (shop && !shop.contact_email ? 1 : 0) + draftCount

  return (
    <main className="org-dashboard container-custom">
      <div className="org-dashboard-shell">
        <OrgDashboardHeader organizationName={organizationName} signedInAs={signedInAs} />
        <OrgDashboardOverview
          eventCount={events.length}
          draftCount={draftCount}
          hasPlace={Boolean(place)}
          hasShop={Boolean(shop)}
          attentionCount={attentionCount}
        />
        <OrgDashboardEvents events={events} placeName={place?.name} />
        <OrgDashboardPresence place={place} shop={shop} productCount={productCount} />
        <OrgAccountSecurity currentEmail={contactEmail} username={username} />
      </div>
    </main>
  )
}
