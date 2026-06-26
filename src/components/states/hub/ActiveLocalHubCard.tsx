import EckeLink from '@/components/EckeLink'
import type { StateHubSummary } from '@/lib/publicStateIndex'

type Props = {
  summary: StateHubSummary
}

export default function ActiveLocalHubCard({ summary }: Props) {
  const { slug, info, stats } = summary

  return (
    <EckeLink href={`/states/${slug}`} className="st-hub-card">
      <span className="st-hub-region">{info.region}</span>
      <span className="st-hub-title">{info.name}</span>
      <div className="st-hub-stats">
        {stats.events + stats.conventions > 0 ? (
          <span className="st-hub-stat">
            {stats.events + stats.conventions} upcoming
          </span>
        ) : null}
        {stats.places > 0 ? <span className="st-hub-stat">{stats.places} places</span> : null}
        {stats.vendors > 0 ? <span className="st-hub-stat">{stats.vendors} vendors</span> : null}
        {stats.education > 0 ? (
          <span className="st-hub-stat">{stats.education} guides</span>
        ) : null}
      </div>
      <span className="st-hub-cta">Open hub →</span>
    </EckeLink>
  )
}
