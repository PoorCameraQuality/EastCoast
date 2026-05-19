'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch } from '@/components/dancecard/api-client'
import { Button } from '@/components/dancecard/ui/Button'

type PresenterProfile = {
  personId: string
  sceneName: string
  pronouns: string | null
  publicBio: string | null
  photoUrl: string | null
  sessions: {
    id: string
    title: string
    startsAt: string
    endsAt: string
    role: string
    trackDisplay: string | null
    locationName: string | null
  }[]
}

type Props = {
  open: boolean
  eventSlug: string
  timezone: string
  personId: string | null
  fallbackName?: string
  onClose: () => void
  onSelectSession?: (slotId: string) => void
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

export function PresenterProfileSheet({
  open,
  eventSlug,
  timezone,
  personId,
  fallbackName,
  onClose,
  onSelectSession,
}: Props) {
  const [profile, setProfile] = useState<PresenterProfile | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!personId) return
    setLoading(true)
    setLoadErr(null)
    try {
      const res = await dancecardFetch<{ presenter: PresenterProfile }>(
        eventSlug,
        `/presenters/${encodeURIComponent(personId)}`,
      )
      setProfile(res.presenter)
    } catch (e) {
      setProfile(null)
      setLoadErr(e instanceof Error ? e.message : 'Could not load presenter profile')
    } finally {
      setLoading(false)
    }
  }, [eventSlug, personId])

  useEffect(() => {
    if (!open || !personId) {
      setProfile(null)
      setLoadErr(null)
      return
    }
    void load()
  }, [open, personId, load])

  if (!open || !personId) return null

  const displayName = profile?.sceneName ?? fallbackName ?? 'Presenter'

  return (
    <div className="fixed inset-0 z-dc-drawer flex items-end justify-center bg-dc-surface/70 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="presenter-profile-title"
        className="flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-dc-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-dc-micro uppercase tracking-wide text-dc-muted">Presenter</p>
            <h2 id="presenter-profile-title" className="mt-1 text-lg font-semibold text-dc-text">
              {displayName}
            </h2>
            {profile?.pronouns ? <p className="mt-1 text-sm text-dc-muted">{profile.pronouns}</p> : null}
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
          {loading ? <p className="text-dc-muted">Loading…</p> : null}
          {loadErr ? <p className="text-red-700">{loadErr}</p> : null}
          {!loading && !loadErr && profile ? (
            <>
              {profile.photoUrl ? (
                <div className="mb-4 overflow-hidden rounded-xl border border-dc-border bg-dc-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.photoUrl} alt="" className="max-h-48 w-full object-cover" />
                </div>
              ) : null}
              {profile.publicBio ? (
                <p className="leading-relaxed text-dc-muted">{profile.publicBio}</p>
              ) : (
                <p className="text-dc-muted">No public bio yet.</p>
              )}
              {profile.sessions.length ? (
                <div className="mt-5">
                  <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Sessions</p>
                  <ul className="mt-2 space-y-2">
                    {profile.sessions.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          className="w-full rounded-xl border border-dc-border bg-dc-surface-muted/50 px-3 py-2 text-left hover:border-dc-accent-border hover:bg-dc-accent-muted/30"
                          onClick={() => onSelectSession?.(s.id)}
                        >
                          <p className="font-medium text-dc-text">{s.title}</p>
                          <p className="mt-0.5 text-xs text-dc-muted">
                            {formatRange(s.startsAt, s.endsAt, timezone)}
                            {s.role ? ` · ${roleLabel(s.role)}` : ''}
                          </p>
                          {s.locationName || s.trackDisplay ? (
                            <p className="mt-0.5 text-xs text-dc-muted">
                              {[s.locationName, s.trackDisplay].filter(Boolean).join(' · ')}
                            </p>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="border-t border-dc-border px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
