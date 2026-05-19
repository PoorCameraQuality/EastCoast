'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import {
  DEFAULT_GOOGLE_SHEET_RANGE,
  parseGoogleSpreadsheetId,
} from '@/lib/dancecard/parseGoogleSpreadsheetId'

type ImportKind = 'program' | 'staff'

type SheetConnection = {
  connected: boolean
  spreadsheetId: string | null
  sheetTitle: string | null
  range: string
  updatedAt: string | null
}

type ImportBatch = {
  id: string
  kind: string
  status: string
  source_filename: string | null
  sheet_name: string | null
  summary: { total?: number; valid?: number; invalid?: number }
}

type ImportRow = {
  id: string
  row_key: string
  kind: ImportKind
  action: string
  draft_status: string
  title: string | null
  person_name: string | null
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function GoogleSheetsImportSection({
  eventSlug,
  kind,
  readOnly,
  canConfigureGoogle,
  onImportLoaded,
  onClearFileUpload,
  onMessage,
  onError,
}: {
  eventSlug: string
  kind: ImportKind
  readOnly: boolean
  canConfigureGoogle: boolean
  onImportLoaded: (batch: ImportBatch, rows: ImportRow[]) => void
  onClearFileUpload?: () => void
  onMessage: (message: string | null) => void
  onError: (message: string | null) => void
}) {
  const [connection, setConnection] = useState<SheetConnection | null>(null)
  const [sheetInput, setSheetInput] = useState('')
  const [range, setRange] = useState(DEFAULT_GOOGLE_SHEET_RANGE)
  const [preview, setPreview] = useState<{ preview: string[][]; rowCount: number; range: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [oauthConfigured, setOauthConfigured] = useState(true)

  const parsedId = parseGoogleSpreadsheetId(sheetInput) ?? connection?.spreadsheetId ?? null

  const loadConnection = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<SheetConnection>(eventSlug, '/google-sheets/connection')
      setConnection(res)
      setRange(res.range || DEFAULT_GOOGLE_SHEET_RANGE)
      if (res.spreadsheetId) {
        setSheetInput(res.spreadsheetId)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load Google Sheets connection'
      if (/not configured|501/i.test(msg)) {
        setOauthConfigured(false)
      }
    }
  }, [eventSlug])

  useEffect(() => {
    void loadConnection()
  }, [loadConnection])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('google') !== 'connected' || params.get('tab') !== 'import') return
    onMessage('Google account connected. Paste your spreadsheet link and load the draft.')
    void loadConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after OAuth redirect
  }, [])

  async function saveSpreadsheet() {
    const id = parseGoogleSpreadsheetId(sheetInput)
    if (!id) {
      onError('Paste a valid Google Sheets URL or spreadsheet ID.')
      return
    }
    setBusy(true)
    onError(null)
    try {
      await organizerDancecardFetch(eventSlug, '/google-sheets/connection', {
        method: 'PATCH',
        body: JSON.stringify({ spreadsheetId: id, range: range.trim() || DEFAULT_GOOGLE_SHEET_RANGE }),
      })
      await loadConnection()
      onMessage('Spreadsheet saved for this event.')
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not save spreadsheet')
    } finally {
      setBusy(false)
    }
  }

  async function runPreview() {
    const id = parsedId
    if (!id) {
      onError('Save a spreadsheet link or ID first.')
      return
    }
    setBusy(true)
    onError(null)
    setPreview(null)
    try {
      const res = await organizerDancecardFetch<{
        preview: string[][]
        rowCount: number
        range: string
      }>(eventSlug, '/google-sheets/preview', {
        method: 'POST',
        body: JSON.stringify({
          spreadsheetId: id,
          range: range.trim() || DEFAULT_GOOGLE_SHEET_RANGE,
        }),
      })
      setPreview(res)
      setShowPreview(true)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Preview failed')
    } finally {
      setBusy(false)
    }
  }

  async function loadFromSheet() {
    const id = parsedId
    if (!id) {
      onError('Save a spreadsheet link or ID first.')
      return
    }
    setBusy(true)
    onError(null)
    onMessage(null)
    try {
      const res = await organizerDancecardFetch<{ batch: ImportBatch; rows: ImportRow[] }>(
        eventSlug,
        '/google-sheets/create-import-batch',
        {
          method: 'POST',
          body: JSON.stringify({
            spreadsheetId: id,
            range: range.trim() || DEFAULT_GOOGLE_SHEET_RANGE,
            kind,
          }),
        },
      )
      onClearFileUpload?.()
      onImportLoaded(res.batch, res.rows)
      onMessage(`Loaded ${res.batch.summary?.total ?? res.rows.length} draft rows from Google Sheets.`)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not load from Google Sheets')
    } finally {
      setBusy(false)
    }
  }

  if (!canConfigureGoogle) {
    return (
      <div className="rounded-2xl border border-dashed border-dc-border bg-dc-elevated-muted p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">Google Sheets</p>
        <p className="mt-2 text-sm text-dc-muted">
          Connecting Google Sheets requires event owner or admin access. You can still upload a CSV or XLSX export
          below, or ask an owner to connect the live sheet on this tab.
        </p>
      </div>
    )
  }

  if (!oauthConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-400/25 bg-amber-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800/90">Google Sheets</p>
        <p className="mt-2 text-sm text-amber-900/90">
          Google OAuth is not configured on this server. Export your sheet as CSV or XLSX and upload below, or ask your
          host to set <code className="rounded bg-dc-surface-muted px-1 text-xs">GOOGLE_OAUTH_CLIENT_ID</code> and related env
          vars.
        </p>
      </div>
    )
  }

  const connectHref = `/api/organizer/dancecard/${encodeURIComponent(eventSlug)}/google-sheets/oauth/start?returnTo=import`

  return (
    <div className="rounded-2xl border border-violet-300/20 bg-violet-100 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/90">Or pull from Google Sheets</p>
          <p className="mt-1 text-sm text-dc-muted">
            Connect your Google account, link the workbook your team already maintains, then load a draft on this board
            — same preview and publish flow as a file upload.
          </p>
        </div>
        <span
          className={cx(
            'shrink-0 rounded-full border px-2.5 py-1 text-dc-micro font-semibold uppercase tracking-wide',
            connection?.connected
              ? 'border-emerald-400/35 bg-emerald-100 text-emerald-800'
              : 'border-dc-border text-dc-muted',
          )}
        >
          {connection?.connected ? 'Google connected' : 'Not connected'}
        </span>
      </div>

      {!connection?.connected ? (
        <a
          href={connectHref}
          className="mt-4 inline-flex rounded-lg border border-violet-300/35 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-500/25"
        >
          Connect Google account
        </a>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">
            Spreadsheet URL or ID
            <input
              type="text"
              disabled={readOnly || busy}
              className="mt-2 block w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
              placeholder="https://docs.google.com/spreadsheets/d/…/edit"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
            />
            {sheetInput.trim() && !parsedId ? (
              <span className="mt-1 block text-xs font-normal normal-case text-red-700">
                Could not read a spreadsheet ID from that value.
              </span>
            ) : null}
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">
            Cell range (A1 notation)
            <input
              type="text"
              disabled={readOnly || busy}
              className="mt-2 block w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 font-mono text-sm text-dc-text"
              placeholder={DEFAULT_GOOGLE_SHEET_RANGE}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            />
            <span className="mt-2 block text-xs font-normal normal-case leading-relaxed text-dc-muted">
              Use the tab name from your workbook, e.g. <strong className="text-dc-text">Grid!A1:Z500</strong>. Row 1
              should be column headers for <strong className="text-dc-text">program</strong> imports. Complex staff
              volunteer grids may still need an XLSX export until multi-tab sheet import ships.
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={readOnly || busy || !parsedId}
              className="rounded-lg border border-dc-border px-3 py-2 text-sm font-semibold text-dc-text hover:bg-white/5 disabled:opacity-50"
              onClick={() => void saveSpreadsheet()}
            >
              Save spreadsheet
            </button>
            <button
              type="button"
              disabled={readOnly || busy || !parsedId}
              className="rounded-lg border border-violet-300/30 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-500/10 disabled:opacity-50"
              onClick={() => void runPreview()}
            >
              Preview cells
            </button>
            <button
              type="button"
              disabled={readOnly || busy || !parsedId}
              className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-dc-text hover:bg-violet-400 disabled:opacity-50"
              onClick={() => void loadFromSheet()}
            >
              {busy ? 'Loading…' : 'Load from Google Sheet'}
            </button>
          </div>
          {showPreview && preview?.preview ? (
            <pre className="max-h-48 overflow-auto rounded-lg border border-dc-border bg-dc-surface-muted p-2 text-[10px] text-dc-muted">
              {JSON.stringify(preview.preview, null, 2)}
              {preview.rowCount > preview.preview.length ? (
                <span className="mt-2 block text-dc-muted">
                  Showing first {preview.preview.length} of {preview.rowCount} rows ({preview.range}).
                </span>
              ) : null}
            </pre>
          ) : null}
        </div>
      )}

      <p className="mt-3 text-xs text-dc-muted">
        API keys and registrant webhooks stay on{' '}
        <Link
          href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=integrations`}
          className="font-semibold text-violet-200 underline underline-offset-2 hover:text-violet-800"
        >
          Integrations
        </Link>
        .
      </p>
    </div>
  )
}
