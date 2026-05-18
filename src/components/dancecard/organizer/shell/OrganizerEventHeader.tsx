'use client'

type Props = {
  eventSlug: string
  readOnly: boolean
  wideCanvas: boolean
  onOpenMenu: () => void
  onToggleWideCanvas: () => void
  onPreviewRole?: (role: 'attendee' | 'staff' | 'safety' | 'public') => void
}

export function OrganizerEventHeader({
  readOnly,
  wideCanvas,
  onOpenMenu,
  onToggleWideCanvas,
  onPreviewRole,
}: Props) {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-dc-border bg-dc-surface/95 px-4 py-2.5 backdrop-blur sm:px-6">
      <button
        type="button"
        className="rounded-lg border border-dc-border px-3 py-1.5 text-sm font-medium text-dc-text md:hidden"
        onClick={onOpenMenu}
      >
        Menu
      </button>

      {readOnly ? (
        <span className="rounded-lg border border-dc-warning/35 bg-dc-warning-muted px-2.5 py-1 text-xs font-medium text-dc-warning">
          Read-only
        </span>
      ) : null}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="hidden rounded-lg border border-dc-border px-3 py-1.5 text-xs font-medium text-dc-muted hover:text-dc-text sm:inline-flex"
          onClick={onToggleWideCanvas}
        >
          {wideCanvas ? 'Standard width' : 'Wide layout'}
        </button>
        {onPreviewRole ? (
          <select
            className="max-w-[10rem] rounded-lg border border-dc-border bg-dc-elevated px-2 py-1.5 text-xs text-dc-text sm:max-w-none sm:text-sm"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value
              if (v) onPreviewRole(v as 'attendee' | 'staff' | 'safety' | 'public')
              e.target.value = ''
            }}
            aria-label="Preview public site as"
          >
            <option value="">Preview as…</option>
            <option value="attendee">Attendee</option>
            <option value="staff">Staff</option>
            <option value="safety">Safety</option>
            <option value="public">Public</option>
          </select>
        ) : null}
        <kbd className="hidden rounded border border-dc-border px-2 py-0.5 text-[10px] text-dc-muted lg:inline">
          ⌘K search
        </kbd>
      </div>
    </header>
  )
}
