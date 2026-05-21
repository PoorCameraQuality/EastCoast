'use client'

import Link from 'next/link'
import DungeonImage from '@/components/dungeons/DungeonImage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

type Props = {
  club: {
    name: string
    slug: string
    location: { city: string; state: string }
    category?: string
    excerpt?: string
    description?: { long?: string }
    logo?: string | null
  }
}

export default function SwingClubCard({ club }: Props) {
  const preview = club.excerpt || club.description?.long || ''
  const stateSlug = stateAbbrToSlug(club.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : null

  return (
    <article className="group/card card-glass card-glass-violet p-4 sm:p-5" aria-label={club.name}>
      <div className="card-glass-wash card-glass-wash-violet" aria-hidden />

      <div className="relative z-10 flex items-start gap-4">
        <DungeonImage
          src={club.logo}
          alt={`${club.name} — swing & lifestyle club in ${club.location.city}, ${club.location.state}`}
          size={48}
          className="flex-shrink-0 rounded-lg ring-1 ring-white/10 transition group-hover/card:ring-violet-500/30"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold leading-snug text-white sm:text-xl">
              <Link
                href={`/swing-clubs/${club.slug}`}
                className="hover:text-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                onClick={() =>
                  trackSelectItemEntity({
                    entityType: 'swingClub',
                    slug: club.slug,
                    name: club.name,
                    itemListName: 'swing_club_card',
                  })
                }
              >
                {club.name}
              </Link>
            </h3>
            {club.category ? (
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200/90">
                {club.category}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-gray-400 sm:text-sm">
            {club.location.city}, {club.location.state}
          </p>
        </div>
      </div>

      {preview ? (
        <p className="relative z-10 mt-4 line-clamp-3 text-sm leading-relaxed text-gray-400">{preview}</p>
      ) : null}

      <div className="relative z-10 mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <Link
          href={`/swing-clubs/${club.slug}`}
          className="btn-primary inline-flex min-h-touch flex-1 items-center justify-center px-4 py-2 text-sm sm:flex-none bg-violet-600 hover:bg-violet-500 border-violet-500/50"
          aria-label={`View listing for ${club.name}`}
          onClick={() =>
            trackSelectItemEntity({
              entityType: 'swingClub',
              slug: club.slug,
              name: club.name,
              itemListName: 'swing_club_card',
            })
          }
        >
          View listing
        </Link>
        {stateSlug && stateName ? (
          <Link
            href={`/states/${stateSlug}`}
            className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-gray-300 transition hover:border-violet-500/30 hover:text-white sm:flex-none"
          >
            {stateName} events
          </Link>
        ) : null}
      </div>
    </article>
  )
}
