import Link from 'next/link'
import type { StateStatEntry } from '@/lib/stateStats'

type Props = {
  stats: StateStatEntry[]
  limit?: number
}

export default function StateQuickChips({ stats, limit = 12 }: Props) {
  const top = stats.slice(0, limit)

  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 snap-x snap-mandatory md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
      aria-label="Top states by activity"
    >
      {top.map((s) => (
        <Link
          key={s.slug}
          href={`/states/${s.slug}`}
          className="inline-flex min-h-touch shrink-0 snap-start items-center gap-2 rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.03] px-3 py-2 text-sm font-medium text-gray-100 shadow-sm backdrop-blur-sm transition hover:border-primary-400/35 hover:from-primary-500/15 hover:text-white sm:px-4"
        >
          <span className="font-bold text-primary-300/90">{s.info.abbr}</span>
          <span className="hidden sm:inline">{s.info.name}</span>
          <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[11px] tabular-nums text-primary-100">
            {s.total}
          </span>
        </Link>
      ))}
    </div>
  )
}
