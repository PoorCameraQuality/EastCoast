'use client'

import Link from 'next/link'
import VendorImage from '@/components/vendors/VendorImage'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'
import type { StorefrontDungeon } from '@/lib/homepageStorefrontData'

type Props = {
  dungeons: StorefrontDungeon[]
}

export default function SpacesPreview({ dungeons }: Props) {
  if (dungeons.length === 0) return null

  return (
    <section className="sf-section" aria-labelledby="spaces-preview-title">
      <div className="container-custom">
        <div className="mb-ecke-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sf-eyebrow">Places</p>
            <h2 id="spaces-preview-title" className="sf-title">
              Spaces worth knowing
            </h2>
            <p className="sf-subhead">
              Dungeons, clubs, studios, and community venues. Confirm rules with each space.
            </p>
          </div>
          <Link href="/dungeons" className="sf-btn-ghost">
            All spaces
          </Link>
        </div>

        <p className="mb-ecke-6 text-sm text-sf-muted">
          Confirm rules with the venue. Look for orientation nights. Check accessibility, parking, dress code,
          and membership requirements.
        </p>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dungeons.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/dungeons/${d.slug}`}
                className="sf-card-lift group flex h-full flex-col rounded-2xl border border-sf-oxblood/25 bg-sf-card/70 p-5"
                onClick={() =>
                  trackSelectItemEntity({
                    entityType: 'dungeon',
                    slug: d.slug,
                    name: d.name,
                    itemListName: 'home_spaces_preview',
                  })
                }
              >
                <div className="flex items-center gap-3">
                  {d.logo ? (
                    <VendorImage src={d.logo} alt="" size={40} />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sf-border bg-sf-raised text-xs font-bold text-sf-gold">
                      {d.location.state}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sf-strong line-clamp-2">{d.name}</h3>
                    <p className="text-xs text-sf-muted">
                      {d.location.city}, {d.location.state}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-sf-muted line-clamp-3">{d.excerpt}</p>
                <span className="mt-4 text-sm font-medium text-sf-gold group-hover:text-sf-strong">
                  View space →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
