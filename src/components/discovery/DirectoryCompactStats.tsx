type Stat = { label: string; value: number | string; accent?: boolean }

type Props = {
  stats: Stat[]
  className?: string
}

/** One-line stats on mobile; pills from `md` up. */
export default function DirectoryCompactStats({ stats, className = '' }: Props) {
  const line = stats.map((s) => `${s.value} ${s.label}`).join(' · ')

  return (
    <div className={className}>
      <p className="text-sm text-gray-400 md:hidden">{line}</p>
      <div className="hidden flex-wrap gap-2 md:flex">
        {stats.map((s) => (
          <div
            key={s.label}
            className={s.accent ? 'discovery-stat-pill-accent' : 'discovery-stat-pill'}
          >
            <span className="tabular-nums font-semibold text-white">{s.value}</span> {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}
