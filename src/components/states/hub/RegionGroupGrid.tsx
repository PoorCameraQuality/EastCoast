import EckeLink from '@/components/EckeLink'
import type { StateHubSummary } from '@/lib/publicStateIndex'

const REGION_GROUPS: { id: string; label: string; regions: string[] }[] = [
  { id: 'northeast', label: 'Northeast & New England', regions: ['Northeast', 'New England'] },
  { id: 'mid-atlantic', label: 'Mid-Atlantic', regions: ['Mid-Atlantic'] },
  { id: 'south', label: 'South', regions: ['South', 'South Central'] },
  { id: 'midwest', label: 'Midwest & Plains', regions: ['Midwest', 'Great Plains'] },
  { id: 'west', label: 'West & Southwest', regions: ['Mountain West', 'Southwest', 'Pacific'] },
  { id: 'canada', label: 'Canada', regions: ['Canada'] },
]

type Props = {
  summaries: StateHubSummary[]
}

export default function RegionGroupGrid({ summaries }: Props) {
  return (
    <div className="space-y-8">
      {REGION_GROUPS.map((group) => {
        const states = summaries.filter((summary) => group.regions.includes(summary.info.region))
        if (states.length === 0) return null
        return (
          <section
            key={group.id}
            id={group.id}
            className="scroll-mt-24"
            aria-labelledby={`st-region-${group.id}`}
          >
            <h3 id={`st-region-${group.id}`} className="st-section-title mb-3">
              {group.label}
            </h3>
            <div className="st-region-grid">
              {states.map((summary) => (
                <EckeLink
                  key={summary.slug}
                  id={summary.slug}
                  href={`/states/${summary.slug}`}
                  className="st-region-card scroll-mt-24"
                >
                  <p className="st-region-abbr">{summary.info.abbr}</p>
                  <p className="st-region-name">{summary.info.name}</p>
                  <p className="st-region-count">
                    {summary.stats.total > 0 ? `${summary.stats.total} listings` : 'Growing hub'}
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
