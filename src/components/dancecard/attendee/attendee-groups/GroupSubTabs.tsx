'use client'

import { cn } from '@/lib/cn'

export function GroupSubTabs<T extends string>({
  tabs,
  active,
  onSelect,
}: {
  tabs: { key: T; label: string }[]
  active: T
  onSelect: (key: T) => void
}) {
  return (
    <div className="-mx-5 mb-3 border-b border-dc-border px-5" role="tablist" aria-label="Group sections">
      <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
        {tabs.map((t) => {
          const selected = active === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(t.key)}
              className={cn(
                'shrink-0 rounded-t-lg px-3 py-2 text-xs font-semibold transition',
                selected
                  ? 'border border-b-0 border-dc-accent-border bg-dc-accent-muted text-dc-accent shadow-[0_-2px_12px_rgba(139,105,20,0.12)]'
                  : 'text-dc-muted hover:bg-dc-surface-muted hover:text-dc-text',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
