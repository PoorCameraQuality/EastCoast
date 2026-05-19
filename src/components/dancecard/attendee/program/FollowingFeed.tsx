'use client'

import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'
import { Panel } from '@/components/dancecard/ui/Panel'
import { cn } from '@/lib/cn'

type Props = {
  slots: ProgramSlot[]
  followedPersonIds: Set<string>
  onSelectSlot?: (slotId: string) => void
  /** Renders inside the program filters panel without an extra card shell. */
  embedded?: boolean
}

export function FollowingFeed({ slots, followedPersonIds, onSelectSlot, embedded }: Props) {
  const followed = slots.filter((s) =>
    (s.presenters ?? []).some((p) => p.personId && followedPersonIds.has(p.personId))
  )
  if (!followedPersonIds.size) {
    if (embedded) return null
    return (
      <Panel>
        <p className="text-sm text-dc-subtle">Follow presenters from the directory to see their sessions here.</p>
      </Panel>
    )
  }
  if (!followed.length) {
    const empty = <p className="text-sm text-dc-subtle">No upcoming sessions for presenters you follow.</p>
    if (embedded) {
      return <div className="mt-4 border-t border-dc-border pt-4">{empty}</div>
    }
    return <Panel>{empty}</Panel>
  }

  const content = (
    <>
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">Following</p>
      <ul className="mt-2 space-y-1.5">
        {followed.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="w-full rounded-lg border border-dc-accent/30 bg-dc-accent-muted/20 px-2 py-1.5 text-left text-sm hover:bg-dc-accent-muted/40"
              onClick={() => onSelectSlot?.(s.id)}
            >
              <span className="font-medium text-dc-text">{s.title}</span>
              <span className="block text-[11px] text-dc-muted">
                {(s.presenters ?? []).map((p) => p.sceneName).join(', ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )

  if (embedded) {
    return <div className={cn('mt-4 space-y-2 border-t border-dc-border pt-4')}>{content}</div>
  }
  return <Panel className="space-y-2">{content}</Panel>
}
