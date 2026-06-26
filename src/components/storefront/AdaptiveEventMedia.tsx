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

  return (
    <div className="event-logo-stage">
      <Image
        src={logoUrl}
        alt=""
        aria-hidden
        width={640}
        height={420}
        className="event-logo-ghost"
        sizes="640px"
        onError={onError}
      />
      <Image
        src={logoUrl}
        alt={alt}
        width={640}
        height={420}
        priority={priority}
        className={logoClass}
        sizes={size === 'showcase' ? '480px' : '280px'}
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
      <div className="event-media-aura" aria-hidden />
      <div className="event-media-aura-secondary" aria-hidden />
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          className="event-media-aura-image object-cover scale-[2] blur-[48px] opacity-40"
          sizes="400px"
          onError={() => setFailed(true)}
        />
      ) : null}

      {showBanner && src ? (
        <>
          <Image
            src={src}
            alt={media.alt}
            fill
            priority={priority}
            className="object-cover"
            sizes={size === 'showcase' ? '(max-width:768px) 100vw, 50vw' : '(max-width:768px) 90vw, 320px'}
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
