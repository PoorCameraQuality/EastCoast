'use client'

import { cn } from '@/lib/cn'

export type AttendeeNavTab =
  | 'program'
  | 'dancecard'
  | 'profile'
  | 'mutual'
  | 'reservations'
  | 'iso'
  | 'attendee_groups'

const TABS: Array<{ key: AttendeeNavTab; label: string; short: string; shortcut: string }> = [
  { key: 'program', label: 'Program', short: 'Program', shortcut: '1' },
  { key: 'dancecard', label: 'My availability', short: 'Avail', shortcut: '2' },
  { key: 'profile', label: 'Profile', short: 'Profile', shortcut: '3' },
  { key: 'mutual', label: 'Compare', short: 'Compare', shortcut: '4' },
  { key: 'reservations', label: 'Reservations', short: 'Reserve', shortcut: '5' },
  { key: 'iso', label: 'ISO board', short: 'ISO', shortcut: '6' },
  { key: 'attendee_groups', label: 'Attendee groups', short: 'Groups', shortcut: '7' },
]

type Props = {
  active: AttendeeNavTab
  onSelect: (tab: AttendeeNavTab) => void
  badges?: Partial<Record<AttendeeNavTab, number>>
  className?: string
}

export function AttendeeBottomNav({
  active,
  onSelect,
  badges,
  className = '',
  hiddenTabs = [],
}: Props & { hiddenTabs?: AttendeeNavTab[] }) {
  const visible = TABS.filter((t) => !hiddenTabs.includes(t.key))
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-dc-chrome border-t border-dc-border bg-dc-surface-muted/95 px-0.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-dc-chrome backdrop-blur-xl lg:hidden',
        className,
      )}
      aria-label="Dancecard sections"
    >
      <div className="mx-auto flex max-w-5xl gap-0.5">
        {visible.map((option) => {
          const badge = badges?.[option.key]
          return (
            <button
              key={option.key}
              type="button"
              aria-current={active === option.key ? 'page' : undefined}
              aria-keyshortcuts={option.shortcut}
              className={cn(
                'dc-hallway-target relative flex min-h-touch min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-center text-[10px] font-semibold leading-tight sm:text-dc-micro',
                active === option.key
                  ? 'bg-dc-accent-muted text-dc-accent'
                  : 'text-dc-muted hover:bg-dc-elevated-muted/80 hover:text-dc-text',
              )}
              onClick={() => onSelect(option.key)}
            >
              <span className="truncate">{option.short}</span>
              <span className="sr-only">{option.label}</span>
              {badge != null && badge > 0 ? (
                <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dc-accent px-1 text-[10px] font-bold text-dc-accent-foreground">
                  {badge > 9 ? '9+' : badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
