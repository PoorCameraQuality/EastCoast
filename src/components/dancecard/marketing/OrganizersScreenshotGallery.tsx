'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ATTENDEE_FEATURES,
  ORGANIZER_FEATURES,
  type MarketingChapter,
  type MarketingFeature,
} from '@/components/dancecard/marketing/marketingWalkthroughData'

/** Native export size for walkthrough PNGs in `public/dancecard/organizers/walkthrough/`. */
const SHOT_WIDTH = 1920
const SHOT_HEIGHT = 1200

/** UI screenshots: skip Next optimization (WebP resize softens small text). */
const SHOT_SIZES_THUMB = '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px'

type FlatShot = {
  src: string
  alt: string
  feature: MarketingFeature
  shotIndex: number
}

function flattenFeatures(features: readonly MarketingFeature[]): FlatShot[] {
  const out: FlatShot[] = []
  for (const feature of features) {
    feature.shots.forEach((shot, shotIndex) => {
      out.push({ ...shot, feature, shotIndex })
    })
  }
  return out
}

function MarketingScreenshot({
  src,
  alt,
  className,
  priority,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={SHOT_WIDTH}
      height={SHOT_HEIGHT}
      unoptimized
      sizes={SHOT_SIZES_THUMB}
      priority={priority}
      className={className}
    />
  )
}

function ScreenshotLightbox({
  shots,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  shots: FlatShot[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const shot = shots[index]

  useEffect(() => {
    if (!shot) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [shot, onClose, onPrev, onNext])

  if (!shot) return null

  const chapterLabel = shot.feature.chapter === 'organizer' ? 'Organizer console' : 'Attendee dancecard'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dc-text/50 p-3 backdrop-blur-sm sm:bg-dc-text/45 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${shot.feature.title} screenshot enlarged`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[min(92vh,100%)] w-full max-w-6xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-dc-border px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:mb-3 sm:border-0 sm:px-0 sm:pt-0">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-dc-accent">
              {chapterLabel} · {shot.feature.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-dc-text">{shot.feature.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-dc-border bg-dc-elevated-muted px-3 py-2 text-sm font-medium text-dc-text transition hover:border-dc-accent-border hover:bg-dc-elevated-solid/80"
          >
            Close
          </button>
        </div>

        <p className="shrink-0 px-3 pb-2 text-center text-[11px] text-dc-muted sm:hidden">
          Pinch or drag to zoom · scroll sideways for detail
        </p>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto overscroll-contain px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:rounded-xl sm:border sm:border-dc-border sm:bg-dc-surface-muted sm:px-2 sm:shadow-2xl sm:ring-1 sm:ring-dc-border">
          {/* Native img: full-resolution file + scroll/pinch on mobile */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shot.src}
            alt={shot.alt}
            width={SHOT_WIDTH}
            height={SHOT_HEIGHT}
            decoding="async"
            draggable={false}
            className="mx-auto block h-auto max-h-[min(70vh,1200px)] w-auto max-w-full select-none object-contain"
          />
        </div>

        {shots.length > 1 ? (
          <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:mt-4 sm:px-0">
            <button
              type="button"
              onClick={onPrev}
              className="rounded-lg border border-dc-border bg-dc-elevated-muted px-4 py-2 text-sm font-medium text-dc-text transition hover:border-dc-accent-border hover:text-dc-accent-hover"
              aria-label="Previous screenshot"
            >
              ← Previous
            </button>
            <span className="text-sm text-dc-muted">
              {index + 1} of {shots.length}
            </span>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-dc-border bg-dc-elevated-muted px-4 py-2 text-sm font-medium text-dc-text transition hover:border-dc-accent-border hover:text-dc-accent-hover"
              aria-label="Next screenshot"
            >
              Next →
            </button>
          </div>
        ) : null}

        <p className="hidden shrink-0 text-center text-xs text-dc-muted sm:mt-3 sm:block">
          Press Esc to close · Arrow keys to browse
        </p>
      </div>
    </div>
  )
}

function FeatureSection({
  feature,
  flatShots,
  onOpen,
}: {
  feature: MarketingFeature
  flatShots: FlatShot[]
  onOpen: (index: number) => void
}) {
  const featureFlat = flatShots.filter((s) => s.feature.id === feature.id)
  const multi = feature.shots.length > 1

  return (
    <article
      id={feature.id}
      className="scroll-mt-28 border-t border-dc-border pt-12 first:border-t-0 first:pt-0"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-8">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-dc-accent/90">{feature.label}</p>
          <h3 className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">{feature.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-dc-muted sm:text-base">{feature.body}</p>
        </div>
        <div
          className={`order-1 -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full lg:order-2 ${multi ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : ''}`}
        >
          {featureFlat.map((shot) => {
            const flatIndex = flatShots.indexOf(shot)
            return (
              <ShotButton
                key={`${shot.src}-${shot.shotIndex}`}
                shot={shot}
                flatIndex={flatIndex}
                onOpen={onOpen}
                wide={feature.wide && !multi}
              />
            )
          })}
        </div>
      </div>
    </article>
  )
}

function ShotButton({
  shot,
  flatIndex,
  onOpen,
  wide,
}: {
  shot: FlatShot
  flatIndex: number
  onOpen: (index: number) => void
  wide?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(flatIndex)}
      className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-none border-y border-dc-border bg-dc-surface-muted text-left shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-dc-border/40 transition hover:border-dc-accent-border hover:ring-dc-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent sm:rounded-xl sm:border ${wide ? 'sm:col-span-2' : ''}`}
      aria-label={`View full size: ${shot.feature.label}`}
    >
      <MarketingScreenshot
        src={shot.src}
        alt={shot.alt}
        className="h-auto w-full transition duration-200 sm:group-hover:scale-[1.01]"
      />
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent pb-3 pt-12 opacity-100 transition sm:pt-10 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
        aria-hidden
      >
        <span className="rounded-full bg-dc-elevated-solid/90 px-3 py-1 text-xs font-medium text-dc-text">
          <span className="sm:hidden">Tap to enlarge</span>
          <span className="hidden sm:inline">Click to enlarge</span>
        </span>
      </span>
    </button>
  )
}

function FeatureChapter({
  chapter,
  features,
  flatShots,
  onOpen,
}: {
  chapter: MarketingChapter
  features: readonly MarketingFeature[]
  flatShots: FlatShot[]
  onOpen: (index: number) => void
}) {
  if (features.length === 0) return null

  let lastPhase: string | undefined

  return (
    <div className="space-y-0">
      {features.map((feature) => {
        const showPhase = chapter === 'organizer' && feature.phase && feature.phase !== lastPhase
        if (showPhase) lastPhase = feature.phase
        return (
          <div key={feature.id}>
            {showPhase ? (
              <h3 className="mb-6 mt-4 border-t border-dc-border pt-10 font-serif text-xl text-dc-text first:mt-0 first:border-t-0 first:pt-0 sm:text-2xl">
                {feature.phase}
              </h3>
            ) : null}
            <FeatureSection feature={feature} flatShots={flatShots} onOpen={onOpen} />
          </div>
        )
      })}
    </div>
  )
}

function MarketingWalkthrough({ chapter }: { chapter: MarketingChapter }) {
  const features = chapter === 'organizer' ? ORGANIZER_FEATURES : ATTENDEE_FEATURES
  const flatShots = useMemo(() => flattenFeatures(features), [features])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + flatShots.length) % flatShots.length))
  }, [flatShots.length])
  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % flatShots.length))
  }, [flatShots.length])

  return (
    <div>
      <FeatureChapter chapter={chapter} features={features} flatShots={flatShots} onOpen={setOpenIndex} />
      {openIndex !== null ? (
        <ScreenshotLightbox shots={flatShots} index={openIndex} onClose={close} onPrev={goPrev} onNext={goNext} />
      ) : null}
    </div>
  )
}

export function OrganizersScreenshotGallery({
  showAttendeeChapter = true,
}: {
  showAttendeeChapter?: boolean
}) {
  return (
    <div className="mt-10 space-y-16">
      <MarketingWalkthrough chapter="organizer" />

      {showAttendeeChapter ? (
        <section aria-labelledby="attendee-chapter-heading" className="border-t border-dc-border pt-14">
          <div className="max-w-3xl">
            <h2 id="attendee-chapter-heading" className="font-serif text-2xl text-dc-text sm:text-3xl">
              What your attendees get on one link
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dc-muted sm:text-base">
              When you hit publish, this is what shows up on their phones. Same schedule, same map, same policies you
              configured in the console. They get announcements, a live program, availability tools, compare and
              reserve, ISO board, tent groups, and sign-in at the door without you re-explaining the camp layout.
            </p>
          </div>
          <MarketingWalkthrough chapter="attendee" />
        </section>
      ) : null}
    </div>
  )
}
