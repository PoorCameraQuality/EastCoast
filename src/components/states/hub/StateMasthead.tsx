import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { getKinkSocialJoinUrl } from '@/lib/kinkSocialMarketing'
import type { StateHubDetail } from '@/lib/publicStateIndex'

type Props = {
  hub: StateHubDetail
}

export default function StateMasthead({ hub }: Props) {
  const { info, stats } = hub
  const year = new Date().getFullYear()

  return (
    <header className="mb-6">
      <p className="st-kicker">
        {info.region} · {info.abbr}
      </p>
      <h1 className="st-masthead-title">
        {info.name} kink events, places, vendors, and education
      </h1>
      <p className="st-masthead-subhead">
        Upcoming events, public venues, local vendors, and guides for exploring the {info.name} scene
        in {year}.
      </p>
      <div className="st-snapshot">
        {stats.events + stats.conventions > 0 ? (
          <span className="st-stat-pill">
            <strong>{stats.events + stats.conventions}</strong> upcoming
          </span>
        ) : null}
        {stats.conventions > 0 ? (
          <span className="st-stat-pill">
            <strong>{stats.conventions}</strong> conventions
          </span>
        ) : null}
        {stats.places > 0 ? (
          <span className="st-stat-pill">
            <strong>{stats.places}</strong> places
          </span>
        ) : null}
        {stats.vendors > 0 ? (
          <span className="st-stat-pill">
            <strong>{stats.vendors}</strong> vendors
          </span>
        ) : null}
        {stats.education > 0 ? (
          <span className="st-stat-pill">
            <strong>{stats.education}</strong> guides
          </span>
        ) : null}
      </div>
      <div className="st-action-bar">
        <EckeLink href={`/calendar`} className="st-btn-violet">
          View calendar
        </EckeLink>
        <EckeLink href={`/events`} className="st-btn-violet">
          Browse events
        </EckeLink>
        <EckeLink href={`/dungeons`} className="st-btn-violet">
          Browse places
        </EckeLink>
        <EckeLink href={`/vendors`} className="st-btn-violet">
          Browse vendors
        </EckeLink>
        <KinkSocialCtaLink
          href={getKinkSocialJoinUrl('state_page')}
          label="Save on kink.social"
          variant="state"
          surface="state_masthead"
          className="st-btn-rose"
        />
      </div>
    </header>
  )
}
