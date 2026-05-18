'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { IcalBusyPreviewPanel } from '@/components/dancecard/organizer/IcalBusyPreviewPanel'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import {
  EntityPickerModal,
  OrganizerConfirmDialog,
  type EntityPickerOption,
} from '@/components/dancecard/organizer/ui'

function downloadUrl(path: string) {
  window.open(path, '_blank', 'noopener,noreferrer')
}

type ExportAction = { label: string; description: string; onClick: () => void }

function ExportGroup({ title, description, actions }: { title: string; description: string; actions: ExportAction[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      <ul className="mt-3 divide-y divide-white/10">
        {actions.map((a) => (
          <li key={a.label} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-slate-200">{a.label}</p>
              <p className="text-xs text-slate-500">{a.description}</p>
            </div>
            <button
              type="button"
              className="mt-1 shrink-0 text-left text-sm text-dc-accent hover:underline sm:mt-0"
              onClick={a.onClick}
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

type ExportJob = { label: string; at: string }

function jobsKey(slug: string) {
  return `dc-export-jobs:${slug}`
}

function recordExportJob(slug: string, label: string) {
  try {
    const raw = localStorage.getItem(jobsKey(slug))
    const prev = raw ? (JSON.parse(raw) as ExportJob[]) : []
    const next = [{ label, at: new Date().toISOString() }, ...prev].slice(0, 20)
    localStorage.setItem(jobsKey(slug), JSON.stringify(next))
    return next
  } catch {
    return []
  }
}

type FeedTokenRow = {
  id: string
  scope: string
  label: string | null
  filterTrackId: string | null
  filterLocationId: string | null
  filterPersonId: string | null
  createdAt: string
  revokedAt: string | null
}

function CalendarFeedsBlock({ slug }: { slug: string }) {
  const [tokens, setTokens] = useState<FeedTokenRow[]>([])
  const [needsMigration, setNeedsMigration] = useState(false)
  const [lastUrl, setLastUrl] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [picker, setPicker] = useState<null | 'track' | 'room' | 'presenter'>(null)
  const [pickerOptions, setPickerOptions] = useState<EntityPickerOption[]>([])
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await organizerDancecardFetch<{ tokens: FeedTokenRow[]; needsMigration?: boolean }>(
        slug,
        '/calendar-feeds',
      )
      setTokens(res.tokens ?? [])
      setNeedsMigration(Boolean(res.needsMigration))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load feeds')
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  async function openPicker(scope: 'track' | 'room' | 'presenter') {
    setPicker(scope)
    try {
      if (scope === 'track') {
        const res = await organizerDancecardFetch<{ tracks: { id: string; name: string }[] }>(slug, '/tracks')
        setPickerOptions((res.tracks ?? []).map((t) => ({ id: t.id, label: t.name })))
      } else if (scope === 'room') {
        const res = await organizerDancecardFetch<{ locations: { id: string; name: string }[] }>(slug, '/locations')
        setPickerOptions((res.locations ?? []).map((l) => ({ id: l.id, label: l.name })))
      } else {
        const res = await organizerDancecardFetch<{ people: { id: string; sceneName: string }[] }>(slug, '/people')
        setPickerOptions((res.people ?? []).map((p) => ({ id: p.id, label: p.sceneName })))
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load options')
      setPicker(null)
    }
  }

  async function createFeed(scope: 'full' | 'track' | 'room' | 'presenter', filterId?: string) {
    setBusy(true)
    setErr(null)
    try {
      const body: Record<string, unknown> = { scope, label: `${scope} feed` }
      if (scope === 'track' && filterId) body.filterTrackId = filterId
      if (scope === 'room' && filterId) body.filterLocationId = filterId
      if (scope === 'presenter' && filterId) body.filterPersonId = filterId
      const res = await organizerDancecardFetch<{ subscribeUrl: string }>(slug, '/calendar-feeds', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setLastUrl(res.subscribeUrl)
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: string) {
    setBusy(true)
    try {
      await organizerDancecardFetch(slug, `/calendar-feeds/${id}/revoke`, { method: 'POST' })
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Revoke failed')
    } finally {
      setBusy(false)
      setRevokeId(null)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <OrganizerConfirmDialog
        open={revokeId !== null}
        title="Revoke feed?"
        message="Subscribers will stop receiving updates from this URL."
        destructive
        confirmLabel="Revoke"
        busy={busy}
        onCancel={() => setRevokeId(null)}
        onConfirm={() => revokeId && void revoke(revokeId)}
      />
      <EntityPickerModal
        open={picker !== null}
        title={picker === 'track' ? 'Choose track' : picker === 'room' ? 'Choose location' : 'Choose person'}
        options={pickerOptions}
        onCancel={() => setPicker(null)}
        onSelect={(id) => {
          const scope = picker!
          setPicker(null)
          void createFeed(scope, id)
        }}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subscribe in Google or Apple Calendar</p>
      <p className="mt-2 text-xs text-slate-400">
        Create a private link attendees can add to their calendar app. Copy the link once — we do not show it again. Revoke
        old links if you rotate.
      </p>
      {needsMigration ? (
        <p className="mt-2 text-xs text-amber-200">
          Calendar links are not enabled on this server yet. Ask your host to apply the latest Dancecard update.
        </p>
      ) : null}
      {err ? <p className="mt-2 text-xs text-rose-300">{err}</p> : null}
      {lastUrl ? (
        <div className="mt-3 rounded-lg border border-dc-accent-border bg-dc-accent-muted p-2 text-xs text-dc-text">
          <p className="font-semibold">New subscribe URL (copy now — won&apos;t be shown again):</p>
          <p className="mt-1 break-all font-mono text-[11px]">{lastUrl}</p>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || needsMigration}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          onClick={() => void createFeed('full')}
        >
          Create full-program feed
        </button>
        <button
          type="button"
          disabled={busy || needsMigration}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          onClick={() => void openPicker('track')}
        >
          Per-track…
        </button>
        <button
          type="button"
          disabled={busy || needsMigration}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          onClick={() => void openPicker('room')}
        >
          Per-room…
        </button>
        <button
          type="button"
          disabled={busy || needsMigration}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          onClick={() => void openPicker('presenter')}
        >
          Per-presenter…
        </button>
      </div>
      <ul className="mt-4 space-y-2 text-xs">
        {tokens.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
            <span>
              <span className="font-mono text-slate-200">{t.scope}</span>
              {t.label ? <span className="text-slate-500"> — {t.label}</span> : null}
              {t.revokedAt ? <span className="text-rose-300"> (revoked)</span> : <span className="text-emerald-300"> (active)</span>}
            </span>
            {!t.revokedAt ? (
              <button
                type="button"
                disabled={busy}
                className="text-rose-300 hover:underline disabled:opacity-40"
                onClick={() => setRevokeId(t.id)}
              >
                Revoke
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ExportsHubPanel({ eventSlug }: { eventSlug: string }) {
  const slug = eventSlug.toLowerCase()
  const base = `/api/organizer/dancecard/${encodeURIComponent(slug)}`
  const [jobs, setJobs] = useState<ExportJob[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(jobsKey(slug))
      if (raw) setJobs(JSON.parse(raw) as ExportJob[])
    } catch {
      setJobs([])
    }
  }, [slug])

  function exportAndLog(label: string, path: string) {
    downloadUrl(path)
    setJobs(recordExportJob(slug, label))
  }

  return (
    <div className="space-y-6 text-sm text-slate-300">
      <div>
        <h2 className="font-serif text-lg text-slate-100">Exports</h2>
        <p className="mt-1 text-slate-400">
          Download spreadsheets for planning, or open print-friendly pages and save as PDF from your browser.
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Recent downloads</h3>
        <p className="mt-1 text-xs text-slate-500">Tracked in this browser only.</p>
        <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-400">
          {jobs.map((j, i) => (
            <li key={`${j.at}-${i}`}>
              {new Date(j.at).toLocaleString()} · {j.label}
            </li>
          ))}
          {!jobs.length ? <li>No exports yet this browser.</li> : null}
        </ul>
      </section>

      <ExportGroup
        title="Program and schedule"
        description="Share the grid with vendors, AV, or print shops."
        actions={[
          {
            label: 'Activities',
            description: 'Full program grid with times, rooms, and activity details.',
            onClick: () => exportAndLog('Activities', `${base}/exports/sessions`),
          },
          {
            label: 'Scheduling problems',
            description: 'Spreadsheet of double-booked rooms, presenters, or photo-policy flags.',
            onClick: () => exportAndLog('Scheduling problems', `${base}/exports/conflict-report`),
          },
        ]}
      />

      <ExportGroup
        title="People and staffing"
        description="Rosters for stage managers, volunteer leads, and backstage."
        actions={[
          {
            label: 'Presenter directory',
            description: 'Scene names, roles, and contact fields from your people list.',
            onClick: () => exportAndLog('Presenter directory', `${base}/exports/presenter-directory`),
          },
          {
            label: 'Volunteer call sheet',
            description: 'Shift-style list for staff and volunteer coordinators.',
            onClick: () => exportAndLog('Volunteer call sheet', `${base}/exports/volunteer-call-sheet`),
          },
        ]}
      />

      <ExportGroup
        title="Registration and compliance"
        description="Back-office lists for check-in, policies, and photography."
        actions={[
          {
            label: 'Registrants',
            description: 'Attendee roster with status and ticket category.',
            onClick: () => exportAndLog('Registrants', `${base}/registrants/export`),
          },
          {
            label: 'Policy acceptances',
            description: 'Ledger of who accepted which policy version.',
            onClick: () => exportAndLog('Policy acceptances', `${base}/policy-acceptances/export?format=csv`),
          },
          {
            label: 'No-photo list',
            description: 'Registrants who opted out or lack photo consent.',
            onClick: () => exportAndLog('No-photo list', `${base}/media/no-photo-list`),
          },
        ]}
      />

      <section className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Print layouts</h3>
        <p className="mt-1 text-xs text-slate-500">Opens a new tab; use Print, then Save as PDF.</p>
        <ul className="mt-3 divide-y divide-white/10">
          <li className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-200">Printable schedule</p>
              <p className="text-xs text-slate-500">Room-by-room or full run-of-show for posting on site.</p>
            </div>
            <Link
              className="text-sm text-dc-accent hover:underline"
              href={`/organizer/dancecard/${slug}/print/schedule`}
              target="_blank"
            >
              Open
            </Link>
          </li>
          <li className="flex flex-col gap-0.5 py-3 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-200">Venue and room signs</p>
              <p className="text-xs text-slate-500">Directional signs sized for doors and hallways.</p>
            </div>
            <Link
              className="text-sm text-dc-accent hover:underline"
              href={`/organizer/dancecard/${slug}/print/venue-signs`}
              target="_blank"
            >
              Open
            </Link>
          </li>
        </ul>
      </section>

      <CalendarFeedsBlock slug={slug} />
      <IcalBusyPreviewPanel eventSlug={slug} />
    </div>
  )
}
