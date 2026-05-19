'use client'

import { cn } from '@/lib/cn'

export type GroupMemberChipPerson = {
  accountId: string
  displayName: string
  username?: string
  avatarUrl?: string | null
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function GroupMemberChip({
  person,
  size = 'sm',
  title,
}: {
  person: GroupMemberChipPerson
  size?: 'sm' | 'xs'
  title?: string
}) {
  const dim = size === 'xs' ? 'h-6 w-6 text-[9px]' : 'h-7 w-7 text-[10px]'
  const label = title ?? (person.username ? `${person.displayName} (@${person.username})` : person.displayName)

  return (
    <span
      className="inline-flex max-w-[9rem] items-center gap-1.5 truncate"
      title={label}
    >
      {person.avatarUrl ? (
        <img src={person.avatarUrl} alt="" className={cn('shrink-0 rounded-full object-cover ring-1 ring-dc-border', dim)} />
      ) : (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full bg-dc-accent-muted font-semibold text-dc-accent ring-1 ring-dc-accent-border/50',
            dim,
          )}
        >
          {initials(person.displayName)}
        </span>
      )}
      <span className={cn('truncate font-medium text-dc-text', size === 'xs' ? 'text-[11px]' : 'text-xs')}>
        {person.displayName}
      </span>
    </span>
  )
}

export function GroupMemberAvatarStack({
  people,
  slotsNeeded,
  slotsOpen,
  onClaimSlot,
  canClaim,
}: {
  people: GroupMemberChipPerson[]
  slotsNeeded: number
  slotsOpen: number
  onClaimSlot?: () => void
  canClaim?: boolean
}) {
  const emptySlots = Math.min(slotsOpen, Math.max(0, slotsNeeded - people.length))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {people.map((p) => (
        <GroupMemberChip key={p.accountId} person={p} size="xs" />
      ))}
      {canClaim && emptySlots > 0 && onClaimSlot ? (
        <button
          type="button"
          onClick={onClaimSlot}
          className="inline-flex h-6 min-w-[4.5rem] items-center justify-center rounded-full border border-dashed border-dc-accent-border bg-dc-accent-muted/50 px-2 text-[10px] font-semibold text-dc-accent hover:bg-dc-accent-muted"
        >
          + Sign up
        </button>
      ) : null}
    </div>
  )
}
