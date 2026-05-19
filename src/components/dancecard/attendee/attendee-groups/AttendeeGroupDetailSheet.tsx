'use client'

import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { AttendeeGroupApplyForm } from '@/components/dancecard/attendee/attendee-groups/AttendeeGroupApplyForm'
import { GroupAnnouncementsPanel } from '@/components/dancecard/attendee/attendee-groups/GroupAnnouncementsPanel'
import { GroupBringPanel, GroupChoresPanel } from '@/components/dancecard/attendee/attendee-groups/GroupTaskPanels'
import { GroupSubTabs } from '@/components/dancecard/attendee/attendee-groups/GroupSubTabs'

type GroupDetail = {
  id: string
  name: string
  description: string
  groupTypeLabel: string
  joinMode: string
  recruitmentStatus: string
  capacityMax: number | null
  memberCount: number
  spotsLeft: number | null
  expectationsMd: string
  externalDiscordUrl: string | null
  externalSheetUrl: string | null
  myRole: string | null
  isMember: boolean
  isAdmin: boolean
  inviteToken?: string
  ownerDisplayName: string
}

type SubTab = 'overview' | 'members' | 'announcements' | 'chores' | 'bring' | 'settings'

type Props = {
  eventSlug: string
  groupId: string | null
  signedIn: boolean
  onClose: () => void
  onChanged: () => void
}

const SUB_TABS: { key: SubTab; label: string; memberOnly?: boolean; adminOnly?: boolean }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'members', label: 'Members', memberOnly: true },
  { key: 'announcements', label: 'Announcements', memberOnly: true },
  { key: 'chores', label: 'Chores', memberOnly: true },
  { key: 'bring', label: 'Bring list', memberOnly: true },
  { key: 'settings', label: 'Settings', adminOnly: true },
]

export function AttendeeGroupDetailSheet({ eventSlug, groupId, signedIn, onClose, onChanged }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('overview')
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!groupId) return
    setErr(null)
    try {
      const res = await dancecardFetch<{ group: GroupDetail }>(eventSlug, `/attendee-groups/${groupId}`)
      setGroup(res.group)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
      setGroup(null)
    }
  }, [eventSlug, groupId])

  useEffect(() => {
    void load()
    setSubTab('overview')
  }, [load])

  if (!groupId) return null

  async function openJoin() {
    if (!group || !signedIn) return
    setBusy(true)
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${group.id}/join`, { method: 'POST', body: '{}' })
      await load()
      onChanged()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const visibleTabs = SUB_TABS.filter((t) => {
    if (t.memberOnly && !group?.isMember) return false
    if (t.adminOnly && !group?.isAdmin) return false
    return true
  })

  return (
    <DetailSheetShell onClose={onClose} groupName={group?.name}>
      {err ? <p className="mb-3 text-sm text-red-700">{err}</p> : null}
      {!group ? (
        <p className="text-sm text-dc-muted">Loading…</p>
      ) : (
        <>
          <GroupSubTabs
            tabs={visibleTabs.map((t) => ({ key: t.key, label: t.label }))}
            active={subTab}
            onSelect={setSubTab}
          />
          <div className="flex-1 overflow-y-auto">
            {subTab === 'overview' ? (
              <OverviewPanel
                group={group}
                signedIn={signedIn}
                busy={busy}
                onJoin={openJoin}
                onApplied={() => {
                  void load()
                  onChanged()
                }}
                eventSlug={eventSlug}
                onChanged={onChanged}
              />
            ) : null}
            {subTab === 'members' ? (
              <MembersPanel eventSlug={eventSlug} groupId={group.id} isAdmin={group.isAdmin} onChanged={onChanged} />
            ) : null}
            {subTab === 'announcements' ? (
              <GroupAnnouncementsPanel eventSlug={eventSlug} groupId={group.id} />
            ) : null}
            {subTab === 'chores' ? <GroupChoresPanel eventSlug={eventSlug} groupId={group.id} /> : null}
            {subTab === 'bring' ? <GroupBringPanel eventSlug={eventSlug} groupId={group.id} /> : null}
            {subTab === 'settings' ? (
              <SettingsPanel eventSlug={eventSlug} group={group} onSaved={() => { void load(); onChanged() }} />
            ) : null}
          </div>
        </>
      )}
    </DetailSheetShell>
  )
}

function DetailSheetShell({
  children,
  onClose,
  groupName,
}: {
  children: React.ReactNode
  onClose: () => void
  groupName?: string
}) {
  return (
    <div className="fixed inset-0 z-dc-drawer flex items-end justify-center bg-dc-surface/70 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-dc-border px-5 py-4">
          <div>
            <p className="text-dc-micro uppercase tracking-wide text-dc-muted">Attendee group</p>
            <h2 className="mt-1 text-lg font-semibold text-dc-text">{groupName ?? '…'}</h2>
          </div>
          <button type="button" className="rounded-lg px-2 text-xl text-dc-muted hover:text-dc-text" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

function OverviewPanel({
  group,
  signedIn,
  busy,
  onJoin,
  onApplied,
  eventSlug,
  onChanged,
}: {
  group: GroupDetail
  signedIn: boolean
  busy: boolean
  onJoin: () => void
  onApplied: () => void
  eventSlug: string
  onChanged: () => void
}) {
  const [reportReason, setReportReason] = useState('')
  const [reportMsg, setReportMsg] = useState<string | null>(null)
  const full = group.spotsLeft === 0
  const canOpenJoin = signedIn && !group.isMember && group.joinMode === 'open' && !full
  const canApply = signedIn && !group.isMember && group.joinMode === 'apply' && !full

  return (
    <div className="space-y-4 text-sm">
      <p className="text-dc-muted">
        {group.groupTypeLabel} · {group.memberCount} member{group.memberCount === 1 ? '' : 's'}
        {group.spotsLeft != null ? ` · ${group.spotsLeft} spots left` : ''}
      </p>
      {group.description ? <p className="text-dc-text">{group.description}</p> : null}
      {group.expectationsMd ? (
        <div className="rounded-xl border border-dc-accent-border/50 bg-dc-accent-muted/35 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dc-accent">Expectations</p>
          <div className="prose prose-sm max-w-none text-dc-text prose-headings:text-dc-text prose-p:leading-relaxed prose-p:text-dc-text prose-strong:text-dc-text prose-li:text-dc-text">
            <ReactMarkdown>{group.expectationsMd}</ReactMarkdown>
          </div>
        </div>
      ) : null}
      {group.isMember ? (
        <div className="space-y-2">
          {group.externalDiscordUrl ? (
            <a href={group.externalDiscordUrl} target="_blank" rel="noopener noreferrer" className="block text-dc-accent underline">
              Discord
            </a>
          ) : null}
          {group.externalSheetUrl ? (
            <a href={group.externalSheetUrl} target="_blank" rel="noopener noreferrer" className="block text-dc-accent underline">
              Shared spreadsheet
            </a>
          ) : null}
        </div>
      ) : null}
      {canOpenJoin ? (
        <button
          type="button"
          disabled={busy}
          className="w-full rounded-xl bg-dc-accent px-4 py-2.5 text-sm font-semibold text-dc-accent-foreground disabled:opacity-50"
          onClick={() => void onJoin()}
        >
          Join group
        </button>
      ) : null}
      {canApply ? <AttendeeGroupApplyForm eventSlug={eventSlug} groupId={group.id} onSuccess={onApplied} /> : null}
      {!signedIn ? <p className="text-dc-muted">Sign in to join or apply.</p> : null}
      {group.isMember ? (
        <p className="rounded-lg border border-dc-accent-border/40 bg-dc-accent-muted/50 px-3 py-2 text-sm font-medium text-dc-accent">
          You are a member ({group.myRole}).
        </p>
      ) : null}
      {signedIn && !group.isMember ? (
        <div className="rounded-xl border border-dc-border p-3">
          <p className="text-xs font-semibold uppercase text-dc-muted">Report this group</p>
          <textarea
            className="mt-2 w-full rounded-lg border border-dc-border bg-dc-elevated px-2 py-1.5 text-sm"
            rows={2}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why are you reporting?"
          />
          <button
            type="button"
            className="mt-2 text-xs text-dc-accent underline"
            onClick={async () => {
              if (!reportReason.trim()) return
              try {
                await dancecardFetch(eventSlug, `/attendee-groups/${group.id}/report`, {
                  method: 'POST',
                  body: JSON.stringify({ reason: reportReason.trim() }),
                })
                setReportMsg('Report submitted.')
                setReportReason('')
                onChanged()
              } catch (e) {
                setReportMsg(formatDancecardApiMessage(e))
              }
            }}
          >
            Submit report
          </button>
          {reportMsg ? <p className="mt-1 text-xs text-dc-muted">{reportMsg}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

function MembersPanel({
  eventSlug,
  groupId,
  isAdmin,
  onChanged,
}: {
  eventSlug: string
  groupId: string
  isAdmin: boolean
  onChanged: () => void
}) {
  const [members, setMembers] = useState<
    { accountId: string; role: string; displayName: string; username: string }[]
  >([])
  const [requests, setRequests] = useState<
    { id: string; fromDisplayName: string; fromUsername: string; message: string }[]
  >([])
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const m = await dancecardFetch<{ members: typeof members }>(eventSlug, `/attendee-groups/${groupId}/members`)
    setMembers(m.members ?? [])
    if (isAdmin) {
      const r = await dancecardFetch<{ requests: typeof requests }>(eventSlug, `/attendee-groups/${groupId}/requests`)
      setRequests(r.requests ?? [])
    }
  }, [eventSlug, groupId, isAdmin])

  useEffect(() => {
    void load()
  }, [load])

  async function respond(requestId: string, action: 'accept' | 'decline') {
    setBusy(requestId)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      })
      await load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      {isAdmin && requests.length ? (
        <div className="mb-4 space-y-2 rounded-xl border border-dc-border p-3">
          <p className="text-xs font-semibold uppercase text-dc-muted">Pending applications</p>
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {r.fromDisplayName}
                {r.fromUsername ? ` (@${r.fromUsername})` : ''}
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  disabled={busy === r.id}
                  className="rounded-lg bg-dc-accent px-2 py-1 text-xs font-semibold text-dc-accent-foreground"
                  onClick={() => void respond(r.id, 'accept')}
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  className="rounded-lg border border-dc-border px-2 py-1 text-xs"
                  onClick={() => void respond(r.id, 'decline')}
                >
                  Decline
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.accountId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              {m.displayName}
              {m.username ? ` (@${m.username})` : ''}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-xs uppercase text-dc-muted">{m.role}</span>
              {isAdmin && m.role !== 'owner' ? (
                <button
                  type="button"
                  className="text-xs text-red-700 underline"
                  onClick={async () => {
                    await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/members?accountId=${m.accountId}`, {
                      method: 'DELETE',
                    })
                    await load()
                    onChanged()
                  }}
                >
                  Remove
                </button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}


function SettingsPanel({
  eventSlug,
  group,
  onSaved,
}: {
  eventSlug: string
  group: GroupDetail
  onSaved: () => void
}) {
  const [recruitmentStatus, setRecruitmentStatus] = useState(group.recruitmentStatus)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save() {
    setBusy(true)
    setMsg(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${group.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ recruitmentStatus }),
      })
      setMsg('Saved.')
      onSaved()
    } catch (e) {
      setMsg(formatDancecardApiMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function regenerateLink() {
    setBusy(true)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${group.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ regenerateInviteToken: true }),
      })
      onSaved()
      setMsg('Invite link regenerated.')
    } catch (e) {
      setMsg(formatDancecardApiMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const inviteUrl =
    typeof window !== 'undefined' && group.inviteToken
      ? `${window.location.origin}/dancecard/${eventSlug}#groups?invite=${group.inviteToken}`
      : ''

  return (
    <div className="space-y-4 text-sm">
      <label className="block">
        <span className="text-xs text-dc-muted">Recruitment status</span>
        <select
          className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
          value={recruitmentStatus}
          onChange={(e) => setRecruitmentStatus(e.target.value)}
        >
          <option value="seeking">Seeking members</option>
          <option value="open">Open</option>
          <option value="full">Full</option>
          <option value="closed">Closed</option>
        </select>
      </label>
      <button
        type="button"
        disabled={busy}
        className="rounded-xl bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground disabled:opacity-50"
        onClick={() => void save()}
      >
        Save settings
      </button>
      {group.inviteToken ? (
        <InviteBlock inviteUrl={inviteUrl} onRegenerate={() => void regenerateLink()} busy={busy} />
      ) : null}
      {group.myRole === 'owner' ? (
        <TransferOwnerBlock eventSlug={eventSlug} groupId={group.id} onDone={onSaved} />
      ) : null}
      {group.isMember ? (
        <button
          type="button"
          disabled={busy}
          className="w-full rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-700"
          onClick={async () => {
            if (!window.confirm('Leave this group?')) return
            setBusy(true)
            try {
              await dancecardFetch(eventSlug, `/attendee-groups/${group.id}/leave`, { method: 'POST', body: '{}' })
              onSaved()
            } catch (e) {
              setMsg(formatDancecardApiMessage(e))
            } finally {
              setBusy(false)
            }
          }}
        >
          Leave group
        </button>
      ) : null}
      {msg ? <p className="text-dc-muted">{msg}</p> : null}
    </div>
  )
}

function TransferOwnerBlock({
  eventSlug,
  groupId,
  onDone,
}: {
  eventSlug: string
  groupId: string
  onDone: () => void
}) {
  const [accountId, setAccountId] = useState('')
  const [members, setMembers] = useState<{ accountId: string; displayName: string }[]>([])

  useEffect(() => {
    void dancecardFetch<{ members: { accountId: string; displayName: string; role: string }[] }>(
      eventSlug,
      `/attendee-groups/${groupId}/members`,
    ).then((d) => {
      setMembers((d.members ?? []).filter((m) => m.role !== 'owner').map((m) => ({ accountId: m.accountId, displayName: m.displayName })))
    })
  }, [eventSlug, groupId])

  return (
    <div className="rounded-xl border border-dc-border p-3">
      <p className="text-xs font-semibold uppercase text-dc-muted">Transfer ownership</p>
      <select
        className="mt-2 w-full rounded-lg border border-dc-border bg-dc-elevated px-2 py-1.5 text-sm"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
      >
        <option value="">Select member…</option>
        {members.map((m) => (
          <option key={m.accountId} value={m.accountId}>
            {m.displayName}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!accountId}
        className="mt-2 rounded-lg bg-dc-accent px-3 py-1.5 text-xs font-semibold text-dc-accent-foreground disabled:opacity-50"
        onClick={async () => {
          await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/transfer-owner`, {
            method: 'POST',
            body: JSON.stringify({ newOwnerAccountId: accountId }),
          })
          onDone()
        }}
      >
        Transfer
      </button>
    </div>
  )
}

function InviteBlock({
  inviteUrl,
  onRegenerate,
  busy,
}: {
  inviteUrl: string
  onRegenerate: () => void
  busy: boolean
}) {
  return (
    <div className="rounded-xl border border-dc-border p-3">
      <p className="text-xs font-semibold uppercase text-dc-muted">Invite link</p>
      {inviteUrl ? (
        <p className="mt-1 break-all text-xs text-dc-text">{inviteUrl}</p>
      ) : null}
      <button type="button" disabled={busy} className="mt-2 text-xs text-dc-accent underline" onClick={onRegenerate}>
        Regenerate link
      </button>
    </div>
  )
}


