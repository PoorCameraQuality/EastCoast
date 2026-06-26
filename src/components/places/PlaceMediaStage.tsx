'use client'

import Image from 'next/image'
import { useState } from 'react'
import DungeonImage from '@/components/dungeons/DungeonImage'
import { galleryHeroImage, galleryPreviewStack, publicSafeGallery } from '@/lib/placeGallery'
import { placeTypeLabel, privacyModeLabel } from '@/lib/publicPlaceIndex'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  size?: 'card' | 'masthead'
}

function placeAuraClass(placeType: PublicPlaceListing['placeType']): string {
  switch (placeType) {
    case 'dungeon':
      return 'place-aura-dungeon'
    case 'swing_lifestyle_club':
      return 'place-aura-swing'
    case 'education_space':
      return 'place-aura-education'
    case 'campground':
      return 'place-aura-outdoor'
    default:
      return 'place-aura-default'
  }
}

function PlaceLogoStage({
  logoUrl,
  name,
  size,
}: {
  logoUrl?: string
  name: string
  size: 'card' | 'masthead'
}) {
  const [error, setError] = useState(false)
  const isMasthead = size === 'masthead'
  const logoClass = isMasthead ? 'place-logo-hero' : 'place-logo-card'

  if (!logoUrl || error) {
    return (
      <span className={`place-logo-aura-initial ${isMasthead ? 'place-logo-aura-initial-masthead' : ''}`} aria-hidden>
        {name.slice(0, 1)}
      </span>
    )
  }

  return (
    <div className="place-logo-stage">
      <Image
        src={logoUrl}
        alt=""
        aria-hidden
        width={640}
        height={360}
        className="place-logo-ghost"
        sizes={isMasthead ? '640px' : '400px'}
        onError={() => setError(true)}
      />
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={640}
        height={360}
        className={logoClass}
        sizes={isMasthead ? '640px' : '400px'}
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function PlaceMediaStage({ place, size = 'card' }: Props) {
  const safe = publicSafeGallery(place.gallery)
  const hero = galleryHeroImage(place.gallery)
  const stack = galleryPreviewStack(place.gallery, 2)
  const cover = place.coverImageUrl ?? hero?.url
  const isMasthead = size === 'masthead'

  if (cover && safe.length >= 2) {
    return (
      <div className={`place-media-stage ${isMasthead ? 'place-media-stage-masthead' : ''}`}>
        <div className="place-media-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" className="place-media-cover-img" loading={isMasthead ? 'eager' : 'lazy'} />
        </div>
        <div className="place-media-stack">
          {stack.slice(0, 2).map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt="" className="place-media-stack-thumb" loading="lazy" />
          ))}
        </div>
        {place.logoUrl ? (
          <div className="place-media-logo-badge">
            <DungeonImage src={place.logoUrl} alt="" size={48} className="rounded-lg" />
          </div>
        ) : null}
      </div>
    )
  }

  if (cover) {
    return (
      <div className={`place-media-stage place-media-stage-single ${isMasthead ? 'place-media-stage-masthead' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" className="place-media-cover-img" loading={isMasthead ? 'eager' : 'lazy'} />
        {place.logoUrl ? (
          <div className="place-media-logo-badge">
            <DungeonImage src={place.logoUrl} alt="" size={48} className="rounded-lg" />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`place-logo-aura ${placeAuraClass(place.placeType)} ${isMasthead ? 'place-logo-aura-masthead' : ''}`}>
      <PlaceLogoStage logoUrl={place.logoUrl} name={place.name} size={size} />
    </div>
  )
}

export function PlaceCardSignals({ place }: { place: PublicPlaceListing }) {
  return (
    <div className="place-card-signals">
      <span className="place-signal">{privacyModeLabel(place.venuePrivacyMode)}</span>
      {place.membershipRequired ? <span className="place-signal">Membership</span> : null}
      {(place.upcomingEventCount ?? 0) > 0 ? (
        <span className="place-signal place-signal-events">
          {place.upcomingEventCount} event{(place.upcomingEventCount ?? 0) === 1 ? '' : 's'}
        </span>
      ) : null}
      {place.newFriendly ? <span className="place-signal">New-friendly</span> : null}
    </div>
  )
}

export function PlaceTypeBadge({ place }: { place: PublicPlaceListing }) {
  return <span className="place-type-badge">{place.categoryLabel ?? placeTypeLabel(place.placeType)}</span>
}
