'use client'

import DungeonCard from '@/components/dungeons/DungeonCard'

type DungeonRow = {
  name: string
  slug: string
  location: { city: string; state: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string | null
}

export default function DungeonDiscoveryHubGrid({ dungeons }: { dungeons: DungeonRow[] }) {
  if (dungeons.length === 0) {
    return (
      <p className="text-gray-400 text-center py-12">
        No venues match this filter yet. Browse the full{' '}
        <a href="/dungeons" className="text-primary-400 underline underline-offset-2">
          dungeons directory
        </a>
        .
      </p>
    )
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
      {dungeons.map((d) => (
        <li key={d.slug}>
          <DungeonCard dungeon={d} />
        </li>
      ))}
    </ul>
  )
}
