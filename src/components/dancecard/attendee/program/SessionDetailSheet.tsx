'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { PhotoPolicyChip } from '@/components/dancecard/attendee/PhotoPolicyChip'
import { PresenterProfileSheet } from '@/components/dancecard/attendee/program/PresenterProfileSheet'
import { Button } from '@/components/dancecard/ui/Button'

type Props = {
  open: boolean
  slot: ProgramSlot | null
  eventSlug: string
  timezone: string
  onClose: () => void
}

function formatRange(startsAt: string, endsAt: string, tz: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz,
  })
  return `${fmt.format(new Date(startsAt))} – ${fmt.format(new Date(endsAt))}`
}

function roleLabel(role: string) {
  return role.replace(/_/g, ' ')
}

export function SessionDetailSheet({ open, slot, eventSlug, timezone, onClose }: Props) {
  const [presenterId, setPresenterId] = useState<string | null>(null)
  const [presenterName, setPresenterName] = useState<string | undefined>(undefined)

  if (!open || !slot) return null

  const roomLabel = slot.locationName ?? slot.room

  return (
    <>
      <div className="fixed inset-0 z-dc-drawer flex items-end justify-center bg-dc-surface/70 p-4 backdrop-blur-sm sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-detail-title"
          className="flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-dc-border px-5 py-4">
            <div>
              <p className="text-dc-micro uppercase tracking-wide text-dc-muted">Activity</p>
              <h2 id="session-detail-title" className="dc-session-title mt-1 text-lg font-semibold text-dc-text">
                {slot.title}
              </h2>
              <p className="mt-1 font-tabular text-sm text-dc-muted">
                {formatRange(slot.startsAt, slot.endsAt, timezone)}
              </p>
            </div>
            <button
              type="button"
              className="dc-hallway-touch rounded-lg px-2 text-dc-muted hover:text-dc-text"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-dc-text">
            {slot.trackDisplay ? (
              <p className="text-dc-muted">
                Track: <span className="text-dc-text">{slot.trackDisplay}</span>
              </p>
            ) : null}
            {roomLabel ? (
              <p className="mt-2 text-dc-muted">
                Location: <span className="text-dc-text">{roomLabel}</span>
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <PhotoPolicyChip policy={slot.photoPolicy} />
              {slot.tagNames?.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-dc-border bg-dc-surface-muted px-2 py-0.5 text-dc-micro text-dc-muted"
                >
                  {t}
                </span>
              ))}
            </div>
            {slot.description ? (
              <div className="mt-4">
                <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Description</p>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed text-dc-text">{slot.description}</p>
              </div>
            ) : null}
            {slot.presenters?.length ? (
              <div className="mt-4">
                <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Presenters</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {slot.presenters.map((p) => (
                    <button
                      key={`${p.personId ?? p.sceneName}-${p.role}`}
                      type="button"
                      disabled={!p.personId}
                      className="rounded-full border border-dc-border bg-dc-surface-muted px-3 py-1 text-sm text-dc-text hover:border-dc-accent-border hover:bg-dc-accent-muted/40 disabled:cursor-default disabled:opacity-70"
                      onClick={() => {
                        if (!p.personId) return
                        setPresenterId(p.personId)
                        setPresenterName(p.sceneName)
                      }}
                    >
                      {p.sceneName}
                      <span className="text-dc-muted"> · {roleLabel(p.role)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-dc-border px-5 py-4">
            {slot.locationId ? (
              <Link
                href={`/dancecard/${eventSlug}/map?locationId=${encodeURIComponent(slot.locationId)}`}
                className="inline-flex min-h-touch items-center rounded-xl border border-dc-border px-3 text-sm text-dc-accent hover:bg-dc-accent-muted"
              >
                View on map
              </Link>
            ) : null}
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
      <PresenterProfileSheet
        open={presenterId != null}
        eventSlug={eventSlug}
        timezone={timezone}
        personId={presenterId}
        fallbackName={presenterName}
        onClose={() => {
          setPresenterId(null)
          setPresenterName(undefined)
        }}
      />
    </>
  )
}
