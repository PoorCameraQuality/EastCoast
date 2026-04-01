import SwingClubCard from '@/components/swingclubs/SwingClubCard'
import type { UnifiedSwingClub } from '@/lib/unifiedSwingClubs'

export default function SwingDiscoveryHubGrid({ clubs }: { clubs: UnifiedSwingClub[] }) {
  if (clubs.length === 0) {
    return (
      <p className="text-gray-400">
        No matching swing clubs for this filter yet.{' '}
        <a href="/dungeons#swing-clubs" className="text-violet-400 underline underline-offset-2">
          Browse all swing clubs
        </a>
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {clubs.map((c) => (
        <SwingClubCard key={c.slug} club={c} />
      ))}
    </div>
  )
}
