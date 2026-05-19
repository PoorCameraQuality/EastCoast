'use client'

import type { AttendeeNavTab } from '@/components/dancecard/attendee/AttendeeBottomNav'
import { cn } from '@/lib/cn'

export type AttendeeSectionTabOption = {
  key: AttendeeNavTab
  label: string
  blurb: string
}

type Props = {
  options: AttendeeSectionTabOption[]
  active: AttendeeNavTab
  onSelect: (tab: AttendeeNavTab) => void
  onCopyLink?: () => void
  size?: 'compact' | 'default'
}

export function AttendeeSectionTabs({ options, active, onSelect, onCopyLink, size = 'default' }: Props) {
  return (
    <div className="space-y-2">
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6"
        role="tablist"
        aria-label="Dancecard sections"
      >
        {options.map((option) => {
          const selected = active === option.key
          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(option.key)}
              className={cn(
                'flex min-w-0 flex-col rounded-xl border text-left transition',
                size === 'compact' ? 'px-2.5 py-2' : 'px-3 py-2.5',
                selected
                  ? 'border-dc-accent-border bg-dc-accent text-dc-accent-foreground shadow-[0_8px_24px_rgba(198,167,94,0.35)]'
                  : 'border-dc-border bg-white/[0.03] text-dc-text hover:border-dc-accent-border/40 hover:bg-white/[0.06] hover:shadow-md',
              )}
            >
              <span className={cn('truncate font-medium', size === 'compact' ? 'text-sm' : 'text-sm')}>
                {option.label}
              </span>
              <span
                className={cn(
                  'mt-0.5 line-clamp-2 leading-snug',
                  size === 'compact' ? 'text-[10px]' : 'text-[10px] sm:text-[11px]',
                  selected ? 'text-dc-accent-foreground/75' : 'text-dc-muted',
                )}
              >
                {option.blurb}
              </span>
            </button>
          )
        })}
      </div>
      {onCopyLink ? (
        <button
          type="button"
          className="text-[11px] font-semibold text-dc-accent underline decoration-dc-accent-border"
          onClick={onCopyLink}
        >
          Copy link to this tab
        </button>
      ) : null}
    </div>
  )
}

/** Short labels for fixed bottom nav when space is tight. */
export const ATTENDEE_TAB_SHORT_LABEL: Record<AttendeeNavTab, string> = {
  program: 'Program',
  dancecard: 'Avail',
  profile: 'Profile',
  mutual: 'Compare',
  reservations: 'Reserve',
  iso: 'ISO',
  attendee_groups: 'Groups',
}
