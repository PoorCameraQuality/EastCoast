'use client'

import Link from 'next/link'
import DungeonImage from '@/components/dungeons/DungeonImage'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

type DungeonCardProps = {
  dungeon: {
    name: string
    slug: string
    location: { city: string; state: string }
    category?: string
    excerpt?: string
    description?: { long?: string }
    logo?: string | null
  }
}

export default function DungeonCard({ dungeon }: DungeonCardProps) {
  const preview = dungeon.excerpt || dungeon.description?.long || ''
  const stateSlug = stateAbbrToSlug(dungeon.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : null

  return (
    <article
      className="group/card relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 shadow-lg transition duration-300 hover:border-primary-500/35 hover:shadow-primary-900/15 sm:p-5"
      aria-label={dungeon.name}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-400/80 via-primary-600/50 to-transparent opacity-0 transition group-hover/card:opacity-100 motion-reduce:opacity-0"
        aria-hidden
      />

      <div className="flex items-start gap-4">
        <DungeonImage
          src={dungeon.logo}
          alt={`${dungeon.name} — BDSM dungeon in ${dungeon.location.city}, ${dungeon.location.state}`}
          size={48}
          className="flex-shrink-0 rounded-lg ring-1 ring-white/10 transition group-hover/card:ring-primary-500/30"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold leading-snug text-white sm:text-xl">
              <Link
                href={`/dungeons/${dungeon.slug}`}
                className="hover:text-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                {dungeon.name}
              </Link>
            </h3>
            {dungeon.category ? (
              <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-200/90">
                {dungeon.category}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs text-gray-400 sm:text-sm">
            {dungeon.location.city}, {dungeon.location.state}
          </p>
        </div>
      </div>

      {preview ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-400">{preview}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
        <Link
          href={`/dungeons/${dungeon.slug}`}
          className="btn-primary inline-flex min-h-touch flex-1 items-center justify-center px-4 py-2 text-sm sm:flex-none"
          aria-label={`View listing for ${dungeon.name}`}
        >
          View listing
        </Link>
        {stateSlug && stateName ? (
          <Link
            href={`/states/${stateSlug}`}
            className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-gray-300 transition hover:border-primary-500/30 hover:text-white sm:flex-none"
          >
            {stateName} events
          </Link>
        ) : null}
      </div>
    </article>
  )
}
