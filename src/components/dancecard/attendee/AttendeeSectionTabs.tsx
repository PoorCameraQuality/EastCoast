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
        className={cn(
          'dc-section-tabs-shell rounded-2xl border border-dc-accent-border/45 bg-gradient-to-b from-dc-elevated-solid via-dc-surface-muted/90 to-dc-surface-muted p-1.5',
        )}
      >
        <div
          className={cn(
            'flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none snap-x snap-mandatory',
            'lg:grid lg:grid-cols-7 lg:overflow-visible lg:snap-none',
          )}
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
                  'dc-section-tab flex min-w-[7.25rem] shrink-0 snap-start flex-col rounded-xl border text-left transition duration-200',
                  'lg:min-w-0 lg:shrink',
                  size === 'compact' ? 'px-2.5 py-2' : 'px-3 py-2.5',
                  selected ? 'dc-section-tab--active' : 'dc-section-tab--inactive',
                )}
              >
                <span className={cn('truncate font-semibold', size === 'compact' ? 'text-sm' : 'text-sm')}>
                  {option.label}
                </span>
                <span
                  className={cn(
                    'mt-0.5 hidden line-clamp-2 leading-snug xl:block',
                    size === 'compact' ? 'text-[10px]' : 'text-[10px]',
                    selected ? 'text-dc-accent-foreground/85' : 'text-dc-muted',
                  )}
                >
                  {option.blurb}
                </span>
              </button>
            )
          })}
        </div>
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
