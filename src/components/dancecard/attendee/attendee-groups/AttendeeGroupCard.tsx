'use client'

import { cn } from '@/lib/cn'

export type AttendeeGroupListItem = {
  id: string
  name: string
  description: string
  groupTypeLabel: string
  recruitmentStatus: string
  memberCount: number
  spotsLeft: number | null
  ownerDisplayName: string
  curatedPin?: boolean
  myRole?: string
}

type Props = {
  group: AttendeeGroupListItem
  onOpen: () => void
}

export function AttendeeGroupCard({ group, onOpen }: Props) {
  const seeking = group.recruitmentStatus === 'seeking' || group.recruitmentStatus === 'open'
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full rounded-2xl border border-dc-border bg-dc-elevated/95 p-4 text-left shadow-[0_12px_36px_rgba(45,38,28,0.28)] transition hover:border-dc-accent-border/50',
        group.curatedPin && 'ring-1 ring-dc-accent/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-dc-text">{group.name}</h3>
            {group.curatedPin ? (
              <span className="rounded-full bg-dc-accent-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-dc-accent">
                Featured
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-dc-surface-muted px-2 py-0.5 text-[10px] font-medium text-dc-muted">
              {group.groupTypeLabel}
            </span>
            {seeking ? (
              <span className="rounded-md bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                Seeking members
              </span>
            ) : null}
            {group.spotsLeft != null ? (
              <span className="text-[10px] text-dc-muted">
                {group.spotsLeft > 0
                  ? `${group.spotsLeft} spot${group.spotsLeft === 1 ? '' : 's'} left`
                  : 'Full'}
              </span>
            ) : (
              <span className="text-[10px] text-dc-muted">
                {group.memberCount} member{group.memberCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-dc-muted"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {group.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-dc-muted">{group.description}</p>
      ) : null}
      <p className="mt-2 text-xs text-dc-muted">
        {group.ownerDisplayName}
        {group.myRole ? ` · You: ${group.myRole}` : ''}
      </p>
    </button>
  )
}
