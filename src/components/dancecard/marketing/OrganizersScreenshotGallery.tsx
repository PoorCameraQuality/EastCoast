'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ATTENDEE_FEATURES,
  ORGANIZER_FEATURES,
  type MarketingChapter,
  type MarketingFeature,
} from '@/components/dancecard/marketing/marketingWalkthroughData'

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${shot.feature.title} screenshot enlarged`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-dc-accent">
              {chapterLabel} · {shot.feature.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-dc-text">{shot.feature.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-dc-border bg-dc-elevated-muted px-3 py-2 text-sm font-medium text-dc-text transition hover:border-dc-accent-border hover:bg-dc-elevated-solid/80"
          >
            Close
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-dc-border bg-dc-surface-muted shadow-2xl ring-1 ring-white/10">
          <Image
            src={shot.src}
            alt={shot.alt}
            width={1920}
            height={1200}
            className="h-auto max-h-[calc(92vh-7rem)] w-full object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {shots.length > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
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

        <p className="mt-3 text-center text-xs text-dc-muted">Press Esc to close · Arrow keys to browse</p>
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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-dc-accent/90">{feature.label}</p>
          <h3 className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">{feature.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-dc-muted sm:text-base">{feature.body}</p>
        </div>
        <div className={multi ? 'grid gap-4 sm:grid-cols-2' : undefined}>
          {featureFlat.map((shot) => {
            const flatIndex = flatShots.indexOf(shot)
            return <ShotButton key={`${shot.src}-${shot.shotIndex}`} shot={shot} flatIndex={flatIndex} onOpen={onOpen} wide={feature.wide && !multi} />
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
      className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-dc-border bg-dc-surface-muted text-left shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition hover:border-dc-accent-border hover:ring-dc-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent ${wide ? 'sm:col-span-2' : ''}`}
      aria-label={`View full size: ${shot.feature.label}`}
    >
      <Image
        src={shot.src}
        alt={shot.alt}
        width={1440}
        height={900}
        className="h-auto w-full transition duration-200 group-hover:scale-[1.01]"
        sizes={wide ? '(min-width: 1024px) 720px, 100vw' : '(min-width: 1024px) 480px, 100vw'}
      />
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/75 via-black/25 to-transparent pb-3 pt-10 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden
      >
        <span className="rounded-full bg-dc-elevated-solid/90 px-3 py-1 text-xs font-medium text-dc-text">
          Click to enlarge
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

  return (
    <div className="space-y-0">
      {features.map((feature) => (
        <FeatureSection key={feature.id} feature={feature} flatShots={flatShots} onOpen={onOpen} />
      ))}
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
              configured. They get announcements, a live program, availability tools, compare and reserve, and sign-in
              at the door without you re-explaining the camp layout.
            </p>
          </div>
          <MarketingWalkthrough chapter="attendee" />
        </section>
      ) : null}
    </div>
  )
}
