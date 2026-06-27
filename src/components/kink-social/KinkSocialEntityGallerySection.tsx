'use client'

import { useState } from 'react'
import type { EntityHeroGalleryItem } from '@/lib/kinkSocialEntityMedia'

type Props = {
  gallery: EntityHeroGalleryItem[]
  title?: string
}

export default function KinkSocialEntityGallerySection({
  gallery,
  title = 'Photo gallery',
}: Props) {
  const sorted = [...gallery].sort((a, b) => a.ordinal - b.ordinal)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!sorted.length) return null

  const active = sorted[activeIndex] ?? sorted[0]

  return (
    <section
      className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6"
      aria-labelledby="entity-gallery-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="entity-gallery-heading" className="text-lg font-serif font-bold text-white">
          {title}
        </h2>
        {sorted.length > 4 ? (
          <span className="text-xs text-gray-400">{sorted.length} photos</span>
        ) : null}
      </div>

      {active ? (
        <figure className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.publicUrl}
            alt={active.altText ?? title}
            className="w-full max-h-[22rem] rounded-xl border border-white/10 object-cover"
          />
          {active.altText ? (
            <figcaption className="mt-2 text-sm text-gray-400">{active.altText}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {sorted.length > 1 ? (
        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
          {sorted.map((item, index) => (
            <button
              key={`${item.ordinal}-${item.publicUrl}`}
              type="button"
              className={`overflow-hidden rounded-lg border p-0 bg-transparent cursor-pointer ${
                index === activeIndex ? 'border-teal-500/55' : 'border-transparent'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={item.altText ?? `Photo ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.publicUrl} alt="" className="block aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
