'use client'

import { useEffect, useState } from 'react'
import { galleryHeroImage, galleryKindLabel, publicSafeGallery } from '@/lib/placeGallery'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

export default function PlaceGallerySection({ place }: Props) {
  const safe = publicSafeGallery(place.gallery)
  const hero = galleryHeroImage(place.gallery) ?? safe[0] ?? null
  const [activeId, setActiveId] = useState(hero?.id ?? '')
  const [previewTiny, setPreviewTiny] = useState(false)
  const active = safe.find((item) => item.id === activeId) ?? hero ?? null

  useEffect(() => {
    if (!active?.url) {
      setPreviewTiny(false)
      return undefined
    }
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (!cancelled) setPreviewTiny(image.naturalWidth < 64 || image.naturalHeight < 64)
    }
    image.src = active.url
    return () => {
      cancelled = true
    }
  }, [active?.url])

  if (!safe.length) {
    return (
      <section id="place-gallery" className="place-gallery-empty" aria-labelledby="place-gallery-heading">
        <h2 id="place-gallery-heading" className="place-section-title">
          Gallery
        </h2>
        <p className="place-gallery-empty-copy">No public photos yet.</p>
      </section>
    )
  }

  if (safe.length === 1) {
    return null
  }

  return (
    <section id="place-gallery" className="place-gallery" aria-labelledby="place-gallery-heading">
      <div className="place-gallery-head">
        <h2 id="place-gallery-heading" className="place-section-title">
          Gallery
        </h2>
        <span className="place-gallery-count">{safe.length} photos</span>
      </div>

      {active && !previewTiny ? (
        <figure className="place-gallery-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.url} alt={active.alt} className="place-gallery-hero-img" />
          {active.caption ? <figcaption className="place-gallery-caption">{active.caption}</figcaption> : null}
        </figure>
      ) : null}

      <div className="place-gallery-thumbs" role="list">
        {safe.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`place-gallery-thumb ${active?.id === item.id ? 'place-gallery-thumb-active' : ''}`}
            onClick={() => setActiveId(item.id)}
            aria-label={item.alt || galleryKindLabel(item.mediaKind)}
            aria-pressed={active?.id === item.id}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" />
          </button>
        ))}
      </div>
    </section>
  )
}
