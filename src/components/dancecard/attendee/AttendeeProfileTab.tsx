'use client'

import { useEffect, useMemo, useState } from 'react'
import { dancecardFetch } from '@/components/dancecard/api-client'
import { AttendeeProfileCard } from '@/components/dancecard/attendee/AttendeeProfileCard'
import { ProfilePhotoField } from '@/components/dancecard/attendee/ProfilePhotoField'
import type { AttendeeProfileConfig, AttendeeProfileStored, AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'
import { buildPublicProfile } from '@/lib/dancecard/attendeeProfile'
import { cn } from '@/lib/cn'

const FIELD =
  'mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2 text-sm text-dc-text outline-none transition focus:border-dc-accent focus:ring-1 focus:ring-dc-accent/30'

type Props = {
  username: string
  displayName: string
  stored: AttendeeProfileStored
  config: AttendeeProfileConfig
  allowCompareByUsername: boolean
  showInCompareDirectory?: boolean
  hideBusyDetailsInCompare?: boolean
  icsRemindBeforeMinutes?: number
  eventSlug?: string
  badgeTagline?: string | null
  avatarPreviewUrl?: string | null
  onSave: (patch: {
    displayName?: string
    profile?: AttendeeProfileStored
    allowCompareByUsername?: boolean
    showInCompareDirectory?: boolean
    hideBusyDetailsInCompare?: boolean
    icsRemindBeforeMinutes?: number
    badgeTagline?: string | null
  }) => Promise<void>
  onRenameClick: () => void
}

export function AttendeeProfileTab({
  username,
  displayName: initialDisplayName,
  stored,
  config,
  allowCompareByUsername,
  showInCompareDirectory = false,
  hideBusyDetailsInCompare = false,
  icsRemindBeforeMinutes = 15,
  eventSlug,
  badgeTagline: initialBadgeTagline = null,
  avatarPreviewUrl: initialAvatarPreviewUrl = null,
  onSave,
  onRenameClick,
}: Props) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [pronouns, setPronouns] = useState(stored.pronouns ?? '')
  const [bio, setBio] = useState(stored.bio ?? '')
  const [photoUrl, setPhotoUrl] = useState(stored.photoUrl ?? '')
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(initialAvatarPreviewUrl)
  const [fetlife, setFetlife] = useState(stored.fetlife ?? '')
  const [discord, setDiscord] = useState(stored.discord ?? '')
  const [telegram, setTelegram] = useState(stored.telegram ?? '')
  const [emailOnCard, setEmailOnCard] = useState(stored.emailOnCard ?? '')
  const [compareByUsername, setCompareByUsername] = useState(allowCompareByUsername)
  const [inDirectory, setInDirectory] = useState(showInCompareDirectory)
  const [hideBusy, setHideBusy] = useState(hideBusyDetailsInCompare)
  const [icsRemind, setIcsRemind] = useState(icsRemindBeforeMinutes)
  const [badgeTagline, setBadgeTagline] = useState(initialBadgeTagline ?? '')
  const [blockUsername, setBlockUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const bioMax = config.bioMaxLength ?? 280

  const previewProfile: AttendeePublicProfile = useMemo(
    () => {
      const base = buildPublicProfile({
        displayName,
        username,
        stored: {
          pronouns: pronouns || null,
          bio: bio || null,
          photoUrl: photoUrl || null,
          fetlife: fetlife || null,
          discord: discord || null,
          telegram: telegram || null,
          emailOnCard: emailOnCard || null,
        },
        config,
        resolvedPhotoUrl: photoPreviewUrl,
      })
      return base
    },
    [bio, config, discord, displayName, emailOnCard, fetlife, photoPreviewUrl, photoUrl, pronouns, telegram, username]
  )

  const anyFieldEnabled =
    config.photo || config.bio || config.pronouns || config.fetlife || config.discord || config.telegram || config.emailOnCard

  async function handleSave() {
    setSaving(true)
    try {
      const profile: AttendeeProfileStored = {}
      if (config.pronouns) profile.pronouns = pronouns.trim() || null
      if (config.bio) profile.bio = bio.trim() || null
      if (config.photo) profile.photoUrl = photoUrl.trim() || null
      if (config.fetlife) profile.fetlife = fetlife.trim() || null
      if (config.discord) profile.discord = discord.trim() || null
      if (config.telegram) profile.telegram = telegram.trim() || null
      if (config.emailOnCard) profile.emailOnCard = emailOnCard.trim() || null

      await onSave({
        displayName: displayName.trim() !== initialDisplayName.trim() ? displayName.trim() : undefined,
        profile,
        allowCompareByUsername: compareByUsername !== allowCompareByUsername ? compareByUsername : undefined,
        showInCompareDirectory: inDirectory !== showInCompareDirectory ? inDirectory : undefined,
        hideBusyDetailsInCompare: hideBusy !== hideBusyDetailsInCompare ? hideBusy : undefined,
        icsRemindBeforeMinutes: icsRemind !== icsRemindBeforeMinutes ? icsRemind : undefined,
        badgeTagline:
          badgeTagline.trim() !== (initialBadgeTagline ?? '').trim() ? badgeTagline.trim() || null : undefined,
      })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="rounded-2xl border border-dc-border bg-dc-elevated/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dc-muted/90">Signed in</p>
            <h2 className="mt-1 truncate text-base font-semibold text-dc-text sm:text-xl">{displayName}</h2>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-dc-subtle">Scene name (public)</p>
            <p className="truncate text-xs text-dc-muted sm:text-sm">@{username}</p>
          </div>
          <div className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:px-3 sm:text-xs">
            Live
          </div>
        </div>
        <div className="mt-3">
          <button
            type="button"
            className="rounded-full border border-dc-border bg-white/[0.03] px-3 py-1 text-xs text-dc-accent-foreground transition hover:bg-dc-accent-muted"
            onClick={onRenameClick}
          >
            Quick rename
          </button>
        </div>
      </div>

      {!anyFieldEnabled ? (
        <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-4 text-sm text-dc-muted">
          Your organizer has not enabled public profile fields for this event yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-3 sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dc-accent">Your public profile</p>
          <h2 className="mt-1 font-serif text-xl text-dc-text">How others see you</h2>
          <p className="mt-1 text-xs leading-relaxed text-dc-muted sm:text-sm">
            {config.bioPrompt?.trim()
              ? config.bioPrompt
              : 'Photo, bio, and contacts appear on Compare, share links, and reservations.'}
          </p>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">
                  Scene name
                </label>
                <input className={FIELD} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                <p className="mt-1 text-[10px] text-dc-subtle">Login stays @{username}.</p>
              </div>
              {config.pronouns ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">
                    Pronouns
                  </label>
                  <input className={FIELD} value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="he/they" />
                </div>
              ) : null}
              {config.bio ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">Bio</label>
                  <textarea
                    className={cn(FIELD, 'min-h-[88px] resize-y')}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={bioMax}
                  />
                  <p className="mt-1 text-[10px] text-dc-subtle">
                    {bio.length}/{bioMax}
                  </p>
                </div>
              ) : null}
              {config.fetlife ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">FetLife</label>
                  <input className={FIELD} value={fetlife} onChange={(e) => setFetlife(e.target.value)} />
                </div>
              ) : null}
              {config.discord ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">Discord</label>
                  <input className={FIELD} value={discord} onChange={(e) => setDiscord(e.target.value)} />
                </div>
              ) : null}
              {config.telegram ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">Telegram</label>
                  <input className={FIELD} value={telegram} onChange={(e) => setTelegram(e.target.value)} />
                </div>
              ) : null}
              {config.emailOnCard ? (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">
                    Email on card
                  </label>
                  <input className={FIELD} type="email" value={emailOnCard} onChange={(e) => setEmailOnCard(e.target.value)} />
                </div>
              ) : null}
              {config.photo && eventSlug ? (
                <ProfilePhotoField
                  eventSlug={eventSlug}
                  displayName={displayName}
                  photoUrl={photoUrl}
                  previewUrl={photoPreviewUrl}
                  onPhotoChange={(nextUrl, nextPreview) => {
                    setPhotoUrl(nextUrl)
                    setPhotoPreviewUrl(nextPreview)
                  }}
                />
              ) : null}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">
                  Badge line
                </label>
                <input
                  className={FIELD}
                  value={badgeTagline}
                  onChange={(e) => setBadgeTagline(e.target.value)}
                  maxLength={200}
                  placeholder="Short line printed on your badge"
                />
                <p className="mt-1 text-[10px] text-dc-subtle">One sentence for your printed name badge at check-in.</p>
              </div>
              <button
                type="button"
                disabled={saving}
                className="w-full rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)] disabled:opacity-50"
                onClick={() => void handleSave()}
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
              {savedFlash ? <p className="text-center text-xs text-dc-success">Profile saved.</p> : null}
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-dc-muted">Live preview</p>
              <AttendeeProfileCard profile={previewProfile} variant="self" compact />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-3">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-dc-border bg-dc-elevated-muted px-2 py-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dc-subtle">Compare by username</p>
            <p className="mt-0.5 text-[10px] leading-snug text-dc-muted">
              Let others open your calendar with <span className="text-dc-text">@{username}</span> (no share link required).
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compareByUsername}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold transition',
              compareByUsername
                ? 'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
                : 'border-dc-border bg-dc-elevated text-dc-muted'
            )}
            onClick={() => setCompareByUsername((v) => !v)}
          >
            {compareByUsername ? 'On' : 'Off'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-dc-subtle">Save profile to apply privacy changes.</p>
        <label className="mt-3 flex items-center justify-between gap-2 text-[10px] text-dc-muted">
          <span>Show me in compare directory</span>
          <input type="checkbox" checked={inDirectory} onChange={(e) => setInDirectory(e.target.checked)} />
        </label>
        <label className="mt-2 flex items-center justify-between gap-2 text-[10px] text-dc-muted">
          <span>Hide busy details in compare</span>
          <input type="checkbox" checked={hideBusy} onChange={(e) => setHideBusy(e.target.checked)} />
        </label>
      </div>

      <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dc-subtle">Calendar reminders</p>
        <p className="mt-1 text-[10px] text-dc-muted">
          Download .ics after saving — calendar apps alert {icsRemind || 15} minutes before saved program sessions.
        </p>
        <select
          className="mt-2 block w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
          value={icsRemind}
          onChange={(e) => setIcsRemind(Number(e.target.value))}
        >
          <option value={0}>Off</option>
          <option value={5}>5 min</option>
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
        </select>
        {eventSlug ? (
          <a
            href={`/api/dancecard/${eventSlug}/ics`}
            download
            className="mt-2 inline-flex rounded-lg border border-violet-400/35 bg-violet-500/15 px-3 py-1.5 text-[11px] font-medium text-violet-50"
          >
            Download calendar (.ics)
          </a>
        ) : null}
      </div>

      {eventSlug ? <BlockUserSection eventSlug={eventSlug} /> : null}
    </div>
  )
}

function BlockUserSection({ eventSlug }: { eventSlug: string }) {
  const [blockUsername, setBlockUsername] = useState('')
  const [blocks, setBlocks] = useState<{ blockedAccountId: string; username: string; displayName: string }[]>([])

  useEffect(() => {
    void dancecardFetch<{ blocks: typeof blocks }>(eventSlug, '/compare/blocks').then(
      (d) => setBlocks(d.blocks ?? []),
      () => setBlocks([])
    )
  }, [eventSlug])

  async function block() {
    const u = blockUsername.trim()
    if (!u) return
    await dancecardFetch(eventSlug, '/compare/blocks', {
      method: 'POST',
      body: JSON.stringify({ username: u }),
    })
    setBlockUsername('')
    const d = await dancecardFetch<{ blocks: typeof blocks }>(eventSlug, '/compare/blocks')
    setBlocks(d.blocks ?? [])
  }

  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dc-subtle">Blocked from compare</p>
      <div className="mt-2 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
          placeholder="@username"
          value={blockUsername}
          onChange={(e) => setBlockUsername(e.target.value)}
        />
        <button type="button" className="rounded-lg border border-dc-border px-2 text-xs" onClick={() => void block()}>
          Block
        </button>
      </div>
      {blocks.length ? (
        <ul className="mt-2 space-y-1 text-xs text-dc-muted">
          {blocks.map((b) => (
            <li key={b.blockedAccountId}>
              {b.displayName} (@{b.username})
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
