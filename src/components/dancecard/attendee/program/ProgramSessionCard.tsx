'use client'

import Link from 'next/link'
import { useState, type MouseEvent } from 'react'
import type { ProgramPresenter, ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { PresenterProfileSheet } from '@/components/dancecard/attendee/program/PresenterProfileSheet'
import { PhotoPolicyChip } from '@/components/dancecard/attendee/PhotoPolicyChip'
import { formatRange, formatTime } from '@/components/dancecard/time'
import { programPoliciesForSlots, policyChipClass } from '@/lib/dancecard/programSlotPolicies'
import { cn } from '@/lib/cn'

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function PresenterBubble({ presenter }: { presenter: ProgramPresenter }) {
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-dc-border bg-dc-elevated shadow-sm"
      title={presenter.sceneName}
    >
      {presenter.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={presenter.photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-dc-accent">
          {initials(presenter.sceneName)}
        </span>
      )}
    </span>
  )
}

export type ProgramSessionCardProps = {
  htmlId?: string
  eventSlug: string
  slot: ProgramSlot
  tz: string
  showTime?: boolean
  selected: boolean
  onToggle: () => void
  followedPersonIds?: Set<string>
  onToggleFollow?: (personId: string, follow: boolean) => void
}

export function ProgramSessionCard({
  htmlId,
  eventSlug,
  slot,
  tz,
  showTime = true,
  selected,
  onToggle,
  followedPersonIds,
  onToggleFollow,
}: ProgramSessionCardProps) {
  const [profilePersonId, setProfilePersonId] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | undefined>(undefined)

  const addLabel = selected ? 'On your dancecard — click to remove' : 'Click to add to My dancecard'
  const policyTags = programPoliciesForSlots([slot])
  const locationLabel = (slot.locationName ?? slot.room)?.trim() || null
  const mapHref =
    slot.locationId != null && String(slot.locationId).trim()
      ? `/dancecard/${encodeURIComponent(eventSlug)}/map?locationId=${encodeURIComponent(String(slot.locationId))}`
      : locationLabel
        ? `/dancecard/${encodeURIComponent(eventSlug)}/map`
        : null

  const presenters = (() => {
    const seen = new Set<string>()
    const out: ProgramPresenter[] = []
    for (const p of slot.presenters ?? []) {
      const key = p.personId ?? p.sceneName
      if (seen.has(key)) continue
      seen.add(key)
      out.push(p)
      if (out.length >= 2) break
    }
    return out
  })()
  const description = (slot.description ?? '').trim()
  const trackLabel = (slot.trackDisplay ?? slot.track)?.trim() || null
  const hasSidePanel = Boolean(description || presenters.length > 0)

  const openPresenter = (p: ProgramPresenter, e: MouseEvent) => {
    e.stopPropagation()
    if (p.personId) {
      setProfilePersonId(p.personId)
      setProfileName(p.sceneName)
    }
  }

  const presenterList = (
    <ul className="space-y-2.5">
      {presenters.map((p) => {
        const following = p.personId ? (followedPersonIds?.has(p.personId) ?? false) : false
        return (
          <li key={`${p.personId ?? p.sceneName}-row`} className="flex items-center gap-3">
            <button
              type="button"
              className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent"
              onClick={(e) => openPresenter(p, e)}
            >
              <PresenterBubble presenter={p} />
            </button>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                className="block truncate text-left text-sm font-medium text-dc-text hover:text-dc-accent"
                onClick={(e) => openPresenter(p, e)}
              >
                {p.sceneName}
              </button>
              {p.role ? (
                <p className="truncate text-[10px] font-medium uppercase tracking-wide text-dc-subtle">{p.role}</p>
              ) : null}
            </div>
            {onToggleFollow && p.personId ? (
              <button
                type="button"
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
                  following
                    ? 'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
                    : 'border-dc-border bg-dc-elevated text-dc-muted hover:border-dc-accent-border hover:text-dc-accent'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFollow(p.personId!, !following)
                }}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </li>
        )
      })}
    </ul>
  )

  const shellClass = cn(
    'w-full min-w-0 overflow-hidden rounded-2xl border shadow-[0_10px_28px_rgba(45,38,28,0.07)] transition',
    selected
      ? 'border-dc-accent-border bg-dc-accent-muted/25 ring-1 ring-dc-accent-border/35'
      : 'border-dc-border/80 bg-dc-elevated hover:border-dc-accent-border/45 hover:shadow-[0_14px_36px_rgba(45,38,28,0.1)]'
  )

  const tagRow = (
    <div className="flex flex-wrap items-center gap-1.5">
      {locationLabel ? (
        <span className="rounded-full border border-dc-accent-border/40 bg-dc-accent-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-dc-accent">
          {locationLabel}
        </span>
      ) : null}
      {trackLabel ? (
        <span className="rounded-full border border-dc-border bg-dc-surface-muted px-2.5 py-0.5 text-[10px] font-semibold text-dc-text-muted">
          {trackLabel}
        </span>
      ) : null}
      {slot.photoPolicy && slot.photoPolicy !== 'allowed' ? <PhotoPolicyChip policy={slot.photoPolicy} /> : null}
      {policyTags.map((policy) => (
        <span
          key={policy.key}
          className={cn(
            'rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]',
            policyChipClass(policy.tone)
          )}
        >
          {policy.label}
        </span>
      ))}
    </div>
  )

  return (
    <>
      <article className={shellClass}>
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <button
            id={htmlId}
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            aria-label={`${slot.title}. ${addLabel}`}
            className={cn(
              'group/main flex min-w-0 flex-col gap-2.5 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dc-accent',
              hasSidePanel || mapHref ? 'lg:flex-[0_0_38%] lg:max-w-[22rem] xl:max-w-[26rem]' : 'flex-1',
              (hasSidePanel || mapHref) && 'lg:border-r lg:border-dc-border/50'
            )}
          >
            <div className={cn('flex gap-3', showTime && 'flex-col sm:flex-row')}>
              {showTime ? (
                <div className="shrink-0 rounded-xl border border-dc-border/70 bg-dc-surface-muted/90 px-3 py-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-dc-muted">Time</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-dc-text">{formatTime(slot.startsAt, tz)}</p>
                  <p className="text-[11px] tabular-nums text-dc-muted">{formatTime(slot.endsAt, tz)}</p>
                </div>
              ) : null}

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="min-w-0 flex-1 font-serif text-lg font-semibold leading-snug text-dc-text">{slot.title}</h4>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]',
                      selected
                        ? 'bg-dc-accent text-dc-accent-foreground shadow-sm'
                        : 'border border-dc-border bg-dc-surface text-dc-muted group-hover/main:border-dc-accent-border group-hover/main:text-dc-accent'
                    )}
                  >
                    {selected ? 'On card' : 'Add'}
                  </span>
                </div>
                {tagRow}
                {showTime ? (
                  <p className="text-[11px] tabular-nums text-dc-muted">{formatRange(slot.startsAt, slot.endsAt, tz)}</p>
                ) : null}
              </div>
            </div>

            {!hasSidePanel && description ? (
              <p className="text-sm leading-relaxed text-dc-text-muted lg:hidden">{description}</p>
            ) : null}
            {!hasSidePanel && presenters.length > 0 ? <div className="lg:hidden">{presenterList}</div> : null}
          </button>

          {hasSidePanel ? (
            <div
              className={cn(
                'flex min-w-0 flex-1 flex-col gap-3 border-t border-dc-border/50 bg-dc-surface-muted/35 p-4 lg:border-t-0',
                mapHref && 'lg:border-r lg:border-dc-border/50'
              )}
            >
              {description ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-dc-muted">About</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-dc-text-muted">{description}</p>
                </div>
              ) : null}
              {presenters.length > 0 ? (
                <div className={description ? 'border-t border-dc-border/40 pt-3' : undefined}>
                  {description ? (
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-dc-muted">Presenters</p>
                  ) : null}
                  {presenterList}
                </div>
              ) : null}
            </div>
          ) : null}

          {mapHref && locationLabel ? (
            <Link
              href={mapHref}
              prefetch={false}
              className="flex shrink-0 items-center justify-between gap-3 border-t border-dc-border/50 bg-dc-elevated-muted/50 px-4 py-3 transition hover:bg-dc-accent-muted/40 lg:w-[5.5rem] lg:flex-col lg:justify-center lg:gap-2 lg:border-t-0 lg:px-3 lg:py-4"
              title={`Open map: ${locationLabel}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-dc-muted">Map</span>
              <span className="text-sm font-semibold text-dc-accent lg:text-center lg:text-xs lg:leading-snug">
                {locationLabel}
              </span>
              <span className="hidden text-dc-accent lg:inline" aria-hidden>
                →
              </span>
            </Link>
          ) : null}
        </div>
      </article>

      <PresenterProfileSheet
        open={profilePersonId != null}
        eventSlug={eventSlug}
        timezone={tz}
        personId={profilePersonId}
        fallbackName={profileName}
        onClose={() => {
          setProfilePersonId(null)
          setProfileName(undefined)
        }}
      />
    </>
  )
}
