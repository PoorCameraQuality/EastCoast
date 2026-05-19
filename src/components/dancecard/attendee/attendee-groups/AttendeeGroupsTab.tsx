'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { AttendeeGroupCard, type AttendeeGroupListItem } from '@/components/dancecard/attendee/attendee-groups/AttendeeGroupCard'
import { AttendeeGroupDetailSheet } from '@/components/dancecard/attendee/attendee-groups/AttendeeGroupDetailSheet'
import { defaultGroupTypeForProfile, labelFor, parseEventProfile, type EventProfileId } from '@/lib/dancecard/eventProfile'
import { cn } from '@/lib/cn'

const DISCLAIMER =
  'User-organized attendee groups are not endorsed by event staff. Meet safely in public first. Do not share passwords or payment info here.'

type Segment = 'discover' | 'mine' | 'create'

type Props = {
  eventSlug: string
  signedIn: boolean
  eventProfile?: string
  initialGroupId?: string | null
  initialInviteToken?: string | null
}

export function AttendeeGroupsTab({
  eventSlug,
  signedIn,
  eventProfile: eventProfileRaw,
  initialGroupId,
  initialInviteToken,
}: Props) {
  const profile = parseEventProfile(eventProfileRaw) as EventProfileId
  const [segment, setSegment] = useState<Segment>('discover')
  const [discover, setDiscover] = useState<AttendeeGroupListItem[]>([])
  const [mine, setMine] = useState<AttendeeGroupListItem[]>([])
  const [pendingOwnerCount, setPendingOwnerCount] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(initialGroupId ?? null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [groupType, setGroupType] = useState(defaultGroupTypeForProfile(profile))
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public')
  const [joinMode, setJoinMode] = useState<'open' | 'apply' | 'invite_only'>('apply')
  const [expectationsMd, setExpectationsMd] = useState('')
  const [createBusy, setCreateBusy] = useState(false)

  const loadDiscover = useCallback(async () => {
    try {
      const res = await dancecardFetch<{ groups: AttendeeGroupListItem[] }>(eventSlug, '/attendee-groups')
      setDiscover(res.groups ?? [])
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  const loadMine = useCallback(async () => {
    if (!signedIn) {
      setMine([])
      return
    }
    try {
      const res = await dancecardFetch<{
        memberships: AttendeeGroupListItem[]
        pendingOwnerCount: number
      }>(eventSlug, '/attendee-groups/mine')
      setMine(res.memberships ?? [])
      setPendingOwnerCount(res.pendingOwnerCount ?? 0)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug, signedIn])

  const refresh = useCallback(async () => {
    setErr(null)
    await Promise.all([loadDiscover(), loadMine()])
  }, [loadDiscover, loadMine])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (initialGroupId) setDetailId(initialGroupId)
  }, [initialGroupId])

  useEffect(() => {
    if (!initialInviteToken || !signedIn) return
    void (async () => {
      try {
        const res = await dancecardFetch<{ groupId: string; joined?: boolean; requiresApply?: boolean }>(
          eventSlug,
          '/attendee-groups/join-by-token',
          { method: 'POST', body: JSON.stringify({ token: initialInviteToken }) },
        )
        if (res.groupId) setDetailId(res.groupId)
        await refresh()
      } catch (e) {
        setErr(formatDancecardApiMessage(e))
      }
    })()
  }, [initialInviteToken, signedIn, eventSlug, refresh])

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!signedIn) return
    setCreateBusy(true)
    setErr(null)
    try {
      const res = await dancecardFetch<{ id: string }>(eventSlug, '/attendee-groups', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          groupType,
          visibility,
          joinMode,
          expectationsMd,
          recruitmentStatus: 'seeking',
        }),
      })
      setName('')
      setDescription('')
      setExpectationsMd('')
      setSegment('mine')
      setDetailId(res.id)
      await refresh()
    } catch (ex) {
      setErr(formatDancecardApiMessage(ex))
    } finally {
      setCreateBusy(false)
    }
  }

  const list = segment === 'discover' ? discover : segment === 'mine' ? mine : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl text-dc-text">{labelFor(profile, 'attendeeGroup')}</h2>
        <p className="mt-1 text-sm text-dc-muted">
          Organize tent cities, room blocks, and crews — chores, bring lists, and member requests in one place.
        </p>
        <p className="mt-2 text-xs text-dc-muted">{DISCLAIMER}</p>
      </div>

      <SegmentNav segment={segment} setSegment={setSegment} pendingOwnerCount={pendingOwnerCount} signedIn={signedIn} />

      {err ? <p className="text-sm text-red-700">{err}</p> : null}

      {segment === 'create' ? (
        signedIn ? (
          <form className="space-y-3 rounded-2xl border border-dc-border bg-dc-elevated/80 p-4" onSubmit={(e) => void createGroup(e)}>
            <p className="text-xs text-dc-muted">{DISCLAIMER}</p>
            <label className="block text-sm">
              <span className="text-dc-muted">Group name</span>
              <input
                required
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-dc-muted">Description</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-dc-muted">Type</span>
              <select
                className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
                value={groupType}
                onChange={(e) => setGroupType(e.target.value as typeof groupType)}
              >
                <option value="tent_city">Tent city</option>
                <option value="hotel_block">Room block</option>
                <option value="cabin">Cabin</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-dc-muted">Visibility</span>
              <select
                className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              >
                <option value="public">Public (discoverable)</option>
                <option value="unlisted">Unlisted (invite link only)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-dc-muted">How people join</span>
              <select
                className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
                value={joinMode}
                onChange={(e) => setJoinMode(e.target.value as typeof joinMode)}
              >
                <option value="open">Open — anyone can join</option>
                <option value="apply">Apply — you approve requests</option>
                <option value="invite_only">Invite only</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-dc-muted">Expectations for new members</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
                rows={4}
                placeholder="House rules, what to bring, quiet hours…"
                value={expectationsMd}
                onChange={(e) => setExpectationsMd(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={createBusy}
              className="w-full rounded-xl bg-dc-accent px-4 py-2.5 text-sm font-semibold text-dc-accent-foreground disabled:opacity-50"
            >
              Create group
            </button>
          </form>
        ) : (
          <p className="text-sm text-dc-muted">Sign in to create an attendee group.</p>
        )
      ) : (
        <>
          {segment === 'mine' && !signedIn ? (
            <p className="text-sm text-dc-muted">Sign in to see your groups.</p>
          ) : !list.length ? (
            <p className="text-sm text-dc-muted">
              {segment === 'discover' ? 'No groups seeking members right now.' : 'You are not in any groups yet.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((g) => (
                <li key={g.id}>
                  <AttendeeGroupCard group={g} onOpen={() => setDetailId(g.id)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <AttendeeGroupDetailSheet
        eventSlug={eventSlug}
        groupId={detailId}
        signedIn={signedIn}
        onClose={() => setDetailId(null)}
        onChanged={() => void refresh()}
      />
    </div>
  )
}

function SegmentNav({
  segment,
  setSegment,
  pendingOwnerCount,
  signedIn,
}: {
  segment: Segment
  setSegment: (s: Segment) => void
  pendingOwnerCount: number
  signedIn: boolean
}) {
  const items: { key: Segment; label: string; badge?: number }[] = [
    { key: 'discover', label: 'Discover' },
    { key: 'mine', label: 'My groups', badge: signedIn && pendingOwnerCount > 0 ? pendingOwnerCount : undefined },
    { key: 'create', label: 'Create' },
  ]
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={cn(
            'relative rounded-full px-3 py-1.5 text-xs font-semibold',
            segment === item.key ? 'bg-dc-accent-muted text-dc-accent' : 'text-dc-muted hover:bg-dc-surface-muted',
          )}
          onClick={() => setSegment(item.key)}
        >
          {item.label}
          {item.badge != null && item.badge > 0 ? (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-dc-accent px-1 text-[10px] text-dc-accent-foreground">
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
