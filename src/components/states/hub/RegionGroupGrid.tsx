import EckeLink from '@/components/EckeLink'
import type { StateHubSummary } from '@/lib/publicStateIndex'

const REGION_GROUPS: { label: string; regions: string[] }[] = [
  { label: 'Northeast & New England', regions: ['Northeast', 'New England'] },
  { label: 'Mid-Atlantic', regions: ['Mid-Atlantic'] },
  { label: 'South', regions: ['South', 'South Central'] },
  { label: 'Midwest & Plains', regions: ['Midwest', 'Great Plains'] },
  { label: 'West & Southwest', regions: ['Mountain West', 'Southwest', 'Pacific'] },
  { label: 'Canada', regions: ['Canada'] },
]

type Props = {
  summaries: StateHubSummary[]
}

export default function RegionGroupGrid({ summaries }: Props) {
  return (
    <div className="space-y-8">
      {REGION_GROUPS.map((group) => {
        const states = summaries.filter((s) => group.regions.includes(s.info.region))
        if (states.length === 0) return null
        return (
          <section key={group.label} aria-labelledby={`st-region-${group.label}`}>
            <h3 id={`st-region-${group.label}`} className="st-section-title mb-3">
              {group.label}
            </h3>
            <div className="st-region-grid">
              {states.map((s) => (
                <EckeLink key={s.slug} href={`/states/${s.slug}`} className="st-region-card">
                  <p className="st-region-abbr">{s.info.abbr}</p>
                  <p className="st-region-name">{s.info.name}</p>
                  <p className="st-region-count">
                    {s.stats.total > 0 ? `${s.stats.total} listings` : 'Growing hub'}
                  </p>
                </EckeLink>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
