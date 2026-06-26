'use client'

import { useState } from 'react'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { galleryHeroImage, galleryKindLabel, publicSafeGallery } from '@/lib/placeGallery'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
}

export default function PlaceGallerySection({ place }: Props) {
  const safe = publicSafeGallery(place.gallery)
  const hero = galleryHeroImage(place.gallery) ?? (safe[0] ?? null)
  const [activeId, setActiveId] = useState(hero?.id ?? '')
  const active = safe.find((m) => m.id === activeId) ?? hero

  if (!safe.length) {
    return (
      <section className="place-gallery-empty" aria-labelledby="place-gallery-heading">
        <h2 id="place-gallery-heading" className="place-section-title">
          Inside the space
        </h2>
        <p className="place-gallery-empty-copy">
          No public gallery yet. Venue owners can publish approved photos from kink.social.
        </p>
        <KinkSocialCtaLink
          href={buildKinkSocialUrl(KINK_SOCIAL_PATHS.orgNew, 'organizer', {
            ref: 'ecke_place_gallery',
            ecke_place: place.slug,
          })}
          label="Create or claim this venue on kink.social"
          variant="organizer"
          surface="place_gallery_empty"
          className="place-btn place-btn-save"
          external
        />
      </section>
    )
  }

  return (
    <section className="place-gallery" aria-labelledby="place-gallery-heading">
      <div className="place-gallery-head">
        <h2 id="place-gallery-heading" className="place-section-title">
          Inside the space
        </h2>
        {safe.length > 4 ? <span className="place-gallery-count">{safe.length} photos</span> : null}
      </div>

      {active ? (
        <figure className="place-gallery-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.url} alt={active.alt} className="place-gallery-hero-img" />
          <figcaption className="place-gallery-caption">
            {active.caption ?? galleryKindLabel(active.mediaKind)}
          </figcaption>
        </figure>
      ) : null}

      <div className="place-gallery-thumbs">
        {safe.slice(0, 5).map((m) => (
          <button
            key={m.id}
            type="button"
            className={`place-gallery-thumb ${active?.id === m.id ? 'place-gallery-thumb-active' : ''}`}
            onClick={() => setActiveId(m.id)}
            aria-label={m.alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt="" />
            <span className="place-gallery-thumb-label">{galleryKindLabel(m.mediaKind)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
