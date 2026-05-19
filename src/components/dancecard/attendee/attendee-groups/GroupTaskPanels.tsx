'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import {
  GroupMemberAvatarStack,
  type GroupMemberChipPerson,
} from '@/components/dancecard/attendee/attendee-groups/GroupMemberChip'
import { cn } from '@/lib/cn'

const SCHEDULE_PRESETS = ['Daily', 'Fri', 'Sat', 'Sun', 'Weekend'] as const

const inputClass =
  'rounded-lg border border-dc-border bg-dc-elevated px-2.5 py-2 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent-border focus:outline-none focus:ring-1 focus:ring-dc-accent-border'

type SignupPerson = GroupMemberChipPerson

type ChoreRow = {
  id: string
  title: string
  done: boolean
  slotsNeeded: number
  scheduleLabel: string
  signups: SignupPerson[]
  slotsOpen: number
  mySignedUp: boolean
}

type BringRow = {
  id: string
  itemLabel: string
  slotsNeeded: number
  scheduleLabel: string
  claims: SignupPerson[]
  slotsOpen: number
  myClaimed: boolean
}

function SchedulePresetChips({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {SCHEDULE_PRESETS.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(value === label ? '' : label)}
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-semibold transition',
            value === label
              ? 'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
              : 'border-dc-border text-dc-muted hover:border-dc-accent-border/50',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function TaskMeta({ slotsNeeded, scheduleLabel, filled }: { slotsNeeded: number; scheduleLabel: string; filled: number }) {
  return (
    <p className="text-[10px] text-dc-muted">
      <span className="font-semibold text-dc-text">
        {filled}/{slotsNeeded}
      </span>{' '}
      filled
      {scheduleLabel ? (
        <>
          {' '}
          · <span className="text-dc-accent">{scheduleLabel}</span>
        </>
      ) : null}
    </p>
  )
}

export function GroupChoresPanel({ eventSlug, groupId }: { eventSlug: string; groupId: string }) {
  const [chores, setChores] = useState<ChoreRow[]>([])
  const [title, setTitle] = useState('')
  const [slotsNeeded, setSlotsNeeded] = useState(1)
  const [scheduleLabel, setScheduleLabel] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await dancecardFetch<{ chores: ChoreRow[] }>(eventSlug, `/attendee-groups/${groupId}/chores`)
    setChores(res.chores ?? [])
  }, [eventSlug, groupId])

  useEffect(() => {
    void load()
  }, [load])

  async function add() {
    if (!title.trim()) return
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/chores`, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          slotsNeeded,
          scheduleLabel: scheduleLabel.trim() || undefined,
        }),
      })
      setTitle('')
      setSlotsNeeded(1)
      setScheduleLabel('')
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  async function toggleDone(id: string, done: boolean) {
    await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/chores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ done: !done }),
    })
    await load()
  }

  async function toggleSignup(id: string, signUp: boolean) {
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/chores/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ signUp }),
      })
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-dc-muted">Only group members can sign up for chores.</p>
      {err ? <p className="text-xs text-dc-danger">{err}</p> : null}
      <div className="space-y-2 rounded-xl border border-dc-border bg-dc-surface-muted/40 p-3">
        <input className={cn(inputClass, 'w-full')} placeholder="New chore" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-dc-muted">
            Slots
            <input
              type="number"
              min={1}
              max={30}
              className={cn(inputClass, 'w-14 py-1 text-center')}
              value={slotsNeeded}
              onChange={(e) => setSlotsNeeded(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
          <SchedulePresetChips value={scheduleLabel} onChange={setScheduleLabel} />
        </div>
        <button
          type="button"
          className="w-full rounded-lg bg-dc-accent px-3 py-2 text-xs font-semibold text-dc-accent-foreground"
          onClick={() => void add()}
        >
          Add chore
        </button>
      </div>
      <ul className="space-y-2">
        {chores.map((c) => (
          <li key={c.id} className="rounded-xl border border-dc-border bg-dc-elevated/80 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={c.done}
                onChange={() => void toggleDone(c.id, c.done)}
                aria-label={`Mark ${c.title} done`}
              />
              <div className="min-w-0 flex-1">
                <p className={cn('font-medium text-dc-text', c.done && 'line-through text-dc-muted')}>{c.title}</p>
                <TaskMeta slotsNeeded={c.slotsNeeded} scheduleLabel={c.scheduleLabel} filled={c.signups.length} />
                <div className="mt-2">
                  <GroupMemberAvatarStack
                    people={c.signups}
                    slotsNeeded={c.slotsNeeded}
                    slotsOpen={c.slotsOpen}
                    canClaim={!c.mySignedUp && c.slotsOpen > 0}
                    onClaimSlot={() => void toggleSignup(c.id, true)}
                  />
                </div>
                {c.mySignedUp ? (
                  <button
                    type="button"
                    className="mt-1.5 text-[10px] font-semibold text-dc-muted underline hover:text-dc-text"
                    onClick={() => void toggleSignup(c.id, false)}
                  >
                    Remove me
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GroupBringPanel({ eventSlug, groupId }: { eventSlug: string; groupId: string }) {
  const [items, setItems] = useState<BringRow[]>([])
  const [label, setLabel] = useState('')
  const [slotsNeeded, setSlotsNeeded] = useState(1)
  const [scheduleLabel, setScheduleLabel] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await dancecardFetch<{ items: BringRow[] }>(eventSlug, `/attendee-groups/${groupId}/bring-items`)
    setItems(res.items ?? [])
  }, [eventSlug, groupId])

  useEffect(() => {
    void load()
  }, [load])

  async function add() {
    if (!label.trim()) return
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/bring-items`, {
        method: 'POST',
        body: JSON.stringify({
          itemLabel: label.trim(),
          slotsNeeded,
          scheduleLabel: scheduleLabel.trim() || undefined,
        }),
      })
      setLabel('')
      setSlotsNeeded(1)
      setScheduleLabel('')
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  async function toggleClaim(id: string, claim: boolean) {
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/bring-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ claim }),
      })
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-dc-muted">Only group members can claim bring-list items.</p>
      {err ? <p className="text-xs text-dc-danger">{err}</p> : null}
      <div className="space-y-2 rounded-xl border border-dc-border bg-dc-surface-muted/40 p-3">
        <input className={cn(inputClass, 'w-full')} placeholder="Item to bring" value={label} onChange={(e) => setLabel(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-dc-muted">
            Needed
            <input
              type="number"
              min={1}
              max={30}
              className={cn(inputClass, 'w-14 py-1 text-center')}
              value={slotsNeeded}
              onChange={(e) => setSlotsNeeded(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
          <SchedulePresetChips value={scheduleLabel} onChange={setScheduleLabel} />
        </div>
        <button
          type="button"
          className="w-full rounded-lg bg-dc-accent px-3 py-2 text-xs font-semibold text-dc-accent-foreground"
          onClick={() => void add()}
        >
          Add item
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="rounded-xl border border-dc-border bg-dc-elevated/80 px-3 py-2.5">
            <p className="font-medium text-dc-text">{i.itemLabel}</p>
            <TaskMeta slotsNeeded={i.slotsNeeded} scheduleLabel={i.scheduleLabel} filled={i.claims.length} />
            <div className="mt-2">
              <GroupMemberAvatarStack
                people={i.claims}
                slotsNeeded={i.slotsNeeded}
                slotsOpen={i.slotsOpen}
                canClaim={!i.myClaimed && i.slotsOpen > 0}
                onClaimSlot={() => void toggleClaim(i.id, true)}
              />
            </div>
            {i.myClaimed ? (
              <button
                type="button"
                className="mt-1.5 text-[10px] font-semibold text-dc-muted underline hover:text-dc-text"
                onClick={() => void toggleClaim(i.id, false)}
              >
                Remove me
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
