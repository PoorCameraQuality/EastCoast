'use client'

import { useState } from 'react'
import { bioExcerpt, buildPresenterIndex } from '@/lib/dancecard/attendee/scheduleSelectors'
import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { PresenterProfileSheet } from '@/components/dancecard/attendee/program/PresenterProfileSheet'
import { Panel } from '@/components/dancecard/ui/Panel'
import { cn } from '@/lib/cn'

type Props = {
  slots: ProgramSlot[]
  eventSlug: string
  timezone: string
  followedPersonIds?: Set<string>
  onToggleFollow?: (personId: string, follow: boolean) => void
  onSelectSlot?: (slotId: string) => void
  /** Renders inside the program filters panel without an extra card shell. */
  embedded?: boolean
}

export function PresenterDirectory({
  slots,
  eventSlug,
  timezone,
  followedPersonIds,
  onToggleFollow,
  onSelectSlot,
  embedded,
}: Props) {
  const index = buildPresenterIndex(slots.map((s) => ({ id: s.id, presenters: s.presenters ?? [] })))
  const [profilePersonId, setProfilePersonId] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | undefined>(undefined)

  if (!index.length) return null

  const showFollowHint = embedded && !(followedPersonIds?.size ?? 0)

  const directory = (
    <div className={cn('space-y-3', embedded && 'mt-4 border-t border-dc-border pt-4')}>
      <div>
        <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Presenters</p>
        {showFollowHint ? (
          <p className="mt-1 text-xs text-dc-subtle">
            Follow presenters here to highlight their sessions in the program below.
          </p>
        ) : null}
      </div>
      <ul className={cn('space-y-2 overflow-y-auto', embedded ? 'max-h-40' : 'max-h-48')}>
          {index.map((p) => {
            const excerpt = bioExcerpt(p.publicBio)
            const following = p.personId ? (followedPersonIds?.has(p.personId) ?? false) : false
            return (
              <li key={`${p.personId}-${p.role}`} className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="text-left hover:text-dc-accent"
                    onClick={() => {
                      setProfilePersonId(p.personId)
                      setProfileName(p.sceneName)
                    }}
                  >
                    <span className="font-semibold text-dc-text">{p.sceneName}</span>
                    <span className="text-dc-muted"> · {p.role.replace(/_/g, ' ')}</span>
                  </button>
                  {onToggleFollow && p.personId ? (
                    <button
                      type="button"
                      className={
                        following
                          ? 'rounded-full border border-dc-accent-border bg-dc-accent-muted px-2 py-0.5 text-dc-micro text-dc-accent'
                          : 'rounded-full border border-dc-border px-2 py-0.5 text-dc-micro text-dc-muted hover:text-dc-accent'
                      }
                      onClick={() => onToggleFollow(p.personId!, !following)}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  ) : null}
                </div>
                {excerpt ? <p className="mt-0.5 line-clamp-2 text-xs text-dc-muted">{excerpt}</p> : null}
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.slotIds.map((id) => {
                    const slot = slots.find((s) => s.id === id)
                    if (!slot) return null
                    return (
                      <button
                        key={id}
                        type="button"
                        className="rounded-full border border-dc-border bg-dc-surface-muted px-2 py-0.5 text-dc-micro text-dc-muted hover:text-dc-accent"
                        onClick={() => onSelectSlot?.(id)}
                      >
                        {slot.title}
                      </button>
                    )
                  })}
                </div>
              </li>
            )
          })}
      </ul>
    </div>
  )

  return (
    <>
      {embedded ? directory : <Panel className="space-y-3">{directory}</Panel>}
      <PresenterProfileSheet
        open={profilePersonId != null}
        eventSlug={eventSlug}
        timezone={timezone}
        personId={profilePersonId}
        fallbackName={profileName}
        onClose={() => {
          setProfilePersonId(null)
          setProfileName(undefined)
        }}
        onSelectSession={(id) => {
          setProfilePersonId(null)
          setProfileName(undefined)
          onSelectSlot?.(id)
        }}
      />
    </>
  )
}
