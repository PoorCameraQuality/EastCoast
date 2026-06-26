import EckeLink from '@/components/EckeLink'
import CalendarEventRow from '@/components/calendar/CalendarEventRow'
import NearbyStates from '@/components/states/hub/NearbyStates'
import StateEducationShelf from '@/components/states/hub/StateEducationShelf'
import StateEventRunway from '@/components/states/hub/StateEventRunway'
import StateMasthead from '@/components/states/hub/StateMasthead'
import StatePlacesShelf from '@/components/states/hub/StatePlacesShelf'
import StatePublishingCta from '@/components/states/hub/StatePublishingCta'
import StateSponsorCard from '@/components/states/hub/StateSponsorCard'
import StateVendorShelf from '@/components/states/hub/StateVendorShelf'
import type { StateHubDetail } from '@/lib/publicStateIndex'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { getNearbyStateSlugs } from '@/lib/stateNeighbors'

type Props = {
  hub: StateHubDetail
}

export default function StateHubView({ hub }: Props) {
  const nearbySlugs = getNearbyStateSlugs(hub.slug)
  const nearby = nearbySlugs
    .map((slug) => ({ slug, info: EAST_COAST_STATES[slug] }))
    .filter(Boolean)

  return (
    <>
      <StateMasthead hub={hub} />

      <StateEventRunway
        events={hub.events}
        conventions={hub.conventions}
        stateName={hub.info.name}
        stateSlug={hub.slug}
      />

      <StatePlacesShelf places={hub.places} stateName={hub.info.name} />
      <StateVendorShelf vendors={hub.vendors} stateName={hub.info.name} />
      <StateEducationShelf items={hub.education} stateName={hub.info.name} />

      {hub.calendarPreview.length > 0 ? (
        <section className="st-section" aria-labelledby="st-calendar-preview">
          <div className="st-section-head">
            <h2 id="st-calendar-preview" className="st-section-title">
              Calendar preview
            </h2>
            <EckeLink href={`/calendar`} className="st-btn-violet">
              Open calendar
            </EckeLink>
          </div>
          <div className="st-event-runway">
            {hub.calendarPreview.slice(0, 5).map((item) => (
              <CalendarEventRow key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <NearbyStates currentSlug={hub.slug as StateSlug} nearby={nearby} />

      <div className="st-section">
        <StatePublishingCta stateName={hub.info.name} />
      </div>
    </>
  )
}

export function StateHubRail({ hub }: Props) {
  return (
    <aside className="st-rail" aria-label="State hub sidebar">
      <div className="st-rail-card">
        <h3 className="st-rail-title">Local snapshot</h3>
        <p className="st-rail-body">
          {hub.stats.events + hub.stats.conventions} upcoming · {hub.stats.places} places ·{' '}
          {hub.stats.vendors} vendors
        </p>
      </div>
      <StatePublishingCta compact stateName={hub.info.name} />
      <StateSponsorCard />
    </aside>
  )
}
