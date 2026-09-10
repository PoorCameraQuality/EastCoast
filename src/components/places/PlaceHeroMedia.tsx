'use client'

import { useMemo, useState } from 'react'
import { galleryHeroImage, galleryKindLabel, publicSafeGallery } from '@/lib/placeGallery'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

function markTiny(image: HTMLImageElement) {
  if (image.naturalWidth < 64 || image.naturalHeight < 64) {
    image.classList.add('place-media-cover-img-tiny')
  } else {
    image.classList.remove('place-media-cover-img-tiny')
  }
}

export default function PlaceHeroMedia({ place }: Props) {
  const safe = useMemo(() => publicSafeGallery(place.gallery), [place.gallery])
  const cover = place.coverImageUrl ?? galleryHeroImage(place.gallery)?.url
  const initial = safe.find((item) => item.url === cover) ?? safe[0] ?? null
  const [activeId, setActiveId] = useState(initial?.id ?? '')
  const active = safe.find((item) => item.id === activeId) ?? initial
  const src = active?.url ?? cover
  const alt = active?.alt || `${place.name} photo`

  if (!src) {
    return (
      <div className="place-hero-frame place-hero-empty" aria-hidden>
        <span className="place-hero-initial">{place.name.slice(0, 1)}</span>
      </div>
    )
  }

  return (
    <div className="place-hero-media">
      <div className="place-hero-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src}
          alt={alt}
          className="place-hero-img"
          loading="eager"
          ref={(image) => {
            if (image?.complete) markTiny(image)
          }}
          onLoad={(event) => markTiny(event.currentTarget)}
        />
        {safe.length > 1 ? (
          <span className="place-profile-photo-count">
            {safe.findIndex((item) => item.id === active?.id) + 1} / {safe.length}
          </span>
        ) : null}
      </div>

      {safe.length > 1 ? (
        <div id="place-gallery" className="place-hero-thumbs" role="list">
          {safe.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`place-hero-thumb ${active?.id === item.id ? 'place-hero-thumb-active' : ''}`}
              onClick={() => setActiveId(item.id)}
              aria-label={item.alt || galleryKindLabel(item.mediaKind)}
              aria-pressed={active?.id === item.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
