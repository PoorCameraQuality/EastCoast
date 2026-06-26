import type { HubCategoryCounts } from '@/lib/homeHubCounts'

type Props = {
  counts: HubCategoryCounts
  upcomingCount: number
  stateHubCount: number
}

const STATS = [
  { key: 'events', label: 'public event listings' },
  { key: 'upcoming', label: 'upcoming highlights' },
  { key: 'dungeons', label: 'spaces and clubs' },
  { key: 'vendors', label: 'vendors and makers' },
  { key: 'states', label: 'states and nationwide listings' },
] as const

export default function InventoryStatStrip({ counts, upcomingCount, stateHubCount }: Props) {
  const values: Record<(typeof STATS)[number]['key'], number> = {
    events: counts.events,
    upcoming: upcomingCount,
    dungeons: counts.dungeons,
    vendors: counts.vendors,
    states: stateHubCount,
  }

  return (
    <section
      className="border-y border-sf-gold/20 bg-sf-surface/90 py-ecke-8"
      aria-label="Directory inventory"
    >
      <div className="container-custom">
        <ul className="grid grid-cols-2 gap-ecke-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-ecke-4">
          {STATS.map(({ key, label }) => (
            <li key={key} className="text-center">
              <p className="sf-stat-num">{values[key]}</p>
              <p className="sf-stat-label">{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
