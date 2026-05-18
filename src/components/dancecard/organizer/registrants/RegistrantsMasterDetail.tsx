'use client'

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'

const DEFAULT_COLUMNS = ['category', 'status', 'vetting', 'email'] as const
type ColumnKey = (typeof DEFAULT_COLUMNS)[number] | 'external'

const COLUMN_LABELS: Record<ColumnKey, string> = {
  category: 'Category',
  status: 'Status',
  vetting: 'Vetting',
  email: 'Email',
  external: 'External',
}

function viewsKey(eventSlug: string) {
  return `dc-registrants-views:${eventSlug.toLowerCase()}`
}

export function RegistrantsMasterDetail<TRow extends { id: string; sceneDisplayName: string }>({
  eventSlug,
  rows,
  readOnly,
  selectedId,
  onSelect,
  renderDetail,
  renderCheckIn,
  renderPersonRosterLink,
  getCell,
}: {
  eventSlug: string
  rows: TRow[]
  readOnly: boolean
  selectedId: string | null
  onSelect: (row: TRow) => void
  renderDetail: () => React.ReactNode
  renderCheckIn?: (row: TRow) => React.ReactNode
  /** When this signup is linked to a roster person, show a shortcut to People → Roster. */
  renderPersonRosterLink?: (row: TRow) => React.ReactNode
  getCell: (row: TRow, col: ColumnKey) => React.ReactNode
}) {
  const [columns, setColumns] = useState<ColumnKey[]>([...DEFAULT_COLUMNS])
  const [showChooser, setShowChooser] = useState(false)
  const [savedViews, setSavedViews] = useState<{ name: string; columns: ColumnKey[] }[]>([])
  const [viewName, setViewName] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(viewsKey(eventSlug))
      if (raw) setSavedViews(JSON.parse(raw) as { name: string; columns: ColumnKey[] }[])
    } catch {
      /* ignore */
    }
  }, [eventSlug])

  const visibleCols = useMemo(() => columns.filter((c) => COLUMN_LABELS[c]), [columns])

  function persistViews(next: { name: string; columns: ColumnKey[] }[]) {
    setSavedViews(next)
    localStorage.setItem(viewsKey(eventSlug), JSON.stringify(next))
  }

  function saveCurrentView() {
    const name = viewName.trim()
    if (!name) return
    const next = [...savedViews.filter((v) => v.name !== name), { name, columns }]
    persistViews(next)
    setViewName('')
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-dc-border px-2 py-1 text-dc-micro text-dc-muted hover:bg-dc-surface-muted"
            onClick={() => setShowChooser((v) => !v)}
          >
            Columns
          </button>
          {savedViews.map((v) => (
            <button
              key={v.name}
              type="button"
              className="rounded-lg border border-dc-border px-2 py-1 text-dc-micro hover:bg-dc-surface-muted"
              onClick={() => setColumns(v.columns)}
            >
              {v.name}
            </button>
          ))}
          <input
            className="rounded-lg border border-dc-border bg-dc-surface px-2 py-1 text-dc-micro"
            placeholder="Save view as…"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
          />
          <button
            type="button"
            className="rounded-lg bg-dc-accent/20 px-2 py-1 text-dc-micro text-dc-accent"
            onClick={saveCurrentView}
          >
            Save view
          </button>
        </div>
        {showChooser ? (
          <div className="flex flex-wrap gap-2 rounded-lg border border-dc-border bg-dc-surface-muted p-2 text-dc-micro">
            {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((c) => (
              <label key={c} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={columns.includes(c)}
                  onChange={(e) => {
                    setColumns((prev) =>
                      e.target.checked ? [...prev, c] : prev.filter((x) => x !== c),
                    )
                  }}
                />
                {COLUMN_LABELS[c]}
              </label>
            ))}
          </div>
        ) : null}
        <div className="overflow-x-auto rounded-xl border border-dc-border">
          <table className="min-w-full text-left text-sm text-dc-text">
            <thead className="border-b border-dc-border bg-dc-surface-muted text-dc-micro uppercase text-dc-muted">
              <tr>
                <th className="px-3 py-2">Name</th>
                {visibleCols.map((c) => (
                  <th key={c} className="px-3 py-2">
                    {COLUMN_LABELS[c]}
                  </th>
                ))}
                {!readOnly && renderCheckIn ? <th className="px-3 py-2">Check-in</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    'cursor-pointer border-b border-dc-border/50 hover:bg-dc-surface-muted',
                    selectedId === r.id && 'bg-dc-accent/10',
                  )}
                  onClick={() => onSelect(r)}
                >
                  <td className="px-3 py-2 font-medium">{r.sceneDisplayName}</td>
                  {visibleCols.map((c) => (
                    <td key={c} className="px-3 py-2 text-dc-muted">
                      {getCell(r, c)}
                    </td>
                  ))}
                  {!readOnly && renderCheckIn ? (
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      {renderCheckIn(r)}
                    </td>
                  ) : null}
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + 1 + (renderCheckIn && !readOnly ? 1 : 0)}
                    className="px-3 py-6 text-center text-dc-muted"
                  >
                    No registrants match filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      {selectedId ? (
        <aside className="w-full shrink-0 rounded-xl border border-dc-border bg-dc-surface p-4 lg:sticky lg:top-4 lg:w-96">
          {(() => {
            const row = rows.find((r) => r.id === selectedId)
            const link = row && renderPersonRosterLink ? renderPersonRosterLink(row) : null
            return link ? <div className="mb-3 text-sm">{link}</div> : null
          })()}
          {renderDetail()}
        </aside>
      ) : (
        <aside className="hidden w-96 shrink-0 rounded-xl border border-dashed border-dc-border p-6 text-sm text-dc-muted lg:block">
          Select a registrant to view details.
        </aside>
      )}
    </div>
  )
}
