'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { EventMedia } from '@/lib/eventMedia'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { eventBrandStyle } from '@/lib/eventBrandTheme'

type Props = {
  media: EventMedia
  brand: EventBrandTheme
  size?: 'showcase' | 'card' | 'rail'
  priority?: boolean
}

function Placeholder({ name, category }: { name: string; category?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || 'E'
  return (
    <div className="event-media-placeholder">
      <span className="event-media-placeholder-mark" aria-hidden>
        {initial}
      </span>
      <span className="event-media-placeholder-name">{name}</span>
      {category ? <span className="event-media-placeholder-cat">{category}</span> : null}
    </div>
  )
}

function logoDims(size: 'showcase' | 'card' | 'rail') {
  switch (size) {
    case 'showcase':
      return { width: 480, height: 315, sizes: '(max-width:768px) 92vw, 480px' }
    case 'rail':
      return { width: 360, height: 240, sizes: '(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw' }
    default:
      return { width: 320, height: 210, sizes: '(max-width:768px) 100vw, 320px' }
  }
}

function bannerSizes(size: 'showcase' | 'card' | 'rail') {
  if (size === 'showcase') return '(max-width:768px) 100vw, 50vw'
  if (size === 'rail') return '(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw'
  return '(max-width:768px) 100vw, 320px'
}

function LogoStage({
  logoUrl,
  alt,
  size,
  priority,
  onError,
}: {
  logoUrl: string
  alt: string
  size: 'showcase' | 'card' | 'rail'
  priority?: boolean
  onError: () => void
}) {
  const logoClass =
    size === 'showcase'
      ? 'event-logo-hero'
      : size === 'rail'
        ? 'event-logo-rail'
        : 'event-logo-card'
  const { width, height, sizes } = logoDims(size)

  return (
    <div className="event-logo-stage">
      <Image
        src={logoUrl}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={logoClass}
        sizes={sizes}
        onError={onError}
      />
    </div>
  )
}

export default function AdaptiveEventMedia({
  media,
  brand,
  size = 'card',
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false)
  const src = media.bannerUrl ?? media.logoUrl ?? media.imageUrl
  const style = eventBrandStyle(brand)
  const showBanner = Boolean(media.isBanner && src && !failed)
  const showLogo = Boolean(!media.isBanner && media.logoUrl && !failed)
  const displayName = media.alt.replace(/ event branding$/, '')

  return (
    <div
      className={`event-media-frame event-media-frame-${size}`}
      style={style}
      data-treatment={brand.treatment}
    >
      {/* Brand glow only — no second remote image download for blur layers */}
      <div className="event-media-aura" aria-hidden />
      <div className="event-media-aura-secondary" aria-hidden />

      {showBanner && src ? (
        <>
          <Image
            src={src}
            alt={media.alt}
            fill
            priority={priority}
            className="object-cover"
            sizes={bannerSizes(size)}
            onError={() => setFailed(true)}
          />
          <div className="event-media-scrim event-media-scrim-poster" />
        </>
      ) : showLogo && media.logoUrl ? (
        <LogoStage
          logoUrl={media.logoUrl}
          alt={media.alt}
          size={size}
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <Placeholder name={displayName} category={brand.treatment === 'monochrome' ? 'Event' : undefined} />
      )}
    </div>
  )
}
