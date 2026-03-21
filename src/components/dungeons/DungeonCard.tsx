'use client'

import Link from 'next/link'
import DungeonImage from '@/components/dungeons/DungeonImage'

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

  return (
    <article className="card-elegant p-4 sm:p-6 flex flex-col gap-4" aria-label={dungeon.name}>
      <div className="flex items-start gap-4">
        <DungeonImage
          src={dungeon.logo}
          alt={`${dungeon.name} — BDSM dungeon in ${dungeon.location.city}, ${dungeon.location.state}`}
          size={48}
          className="flex-shrink-0"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-serif font-semibold text-white line-clamp-2">
              {dungeon.name}
            </h3>
            {dungeon.category ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-wide text-gray-300">
                {dungeon.category}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {dungeon.location.city}, {dungeon.location.state}
          </p>
        </div>
      </div>

      {preview ? (
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
          {preview}
        </p>
      ) : null}

      <div className="mt-auto">
        <Link
          href={`/dungeons/${dungeon.slug}`}
          className="btn-primary min-h-touch inline-flex items-center justify-center px-4 py-2 text-sm w-full sm:w-auto"
          aria-label={`View listing for ${dungeon.name}`}
        >
          View Listing
        </Link>
      </div>
    </article>
  )
}
