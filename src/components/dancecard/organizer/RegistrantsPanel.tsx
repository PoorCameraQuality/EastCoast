'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { OrganizerApiError, organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { InlineSuccessBanner, useConfirmDialog } from '@/components/dancecard/organizer/ui'
import { checkInTimingLabel, type CheckInEligibility, type CheckInTiming } from '@/lib/dancecard/registrantCheckIn'
import { RegistrantsMasterDetail } from '@/components/dancecard/organizer/registrants/RegistrantsMasterDetail'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import {
  organizerRoleCanEditVettingSafetyNotes,
  organizerRoleCanSeeRegistrantInternalNotes,
} from '@/lib/dancecard/organizerRoles'
import { copy } from '@/lib/dancecard/productCopy'
import { PEOPLE_SUB_TAB_PARAM } from '@/components/dancecard/organizer/shell/organizerNavConfig'

type RegRow = {
  id: string
  categoryId: string
  categoryName: string | null
  personId: string | null
  status: string
  sceneDisplayName: string
  email: string | null
  legalName: string | null
  internalNotes: string | null
  vettingStatus: string
  vettingSafetyNotes: string | null
  pronouns: string | null
  externalSource: string | null
  externalId: string | null
  lastSyncedAt: string | null
  createdAt: string
  checkInValidFrom: string | null
  checkInValidThrough: string | null
  checkInEligibility: CheckInEligibility
  checkInTiming: CheckInTiming | null
  checkedInAt: string | null
}

type CheckInTone = 'gold' | 'blue' | 'red' | 'neutral'

function rowCheckInTone(r: RegRow): CheckInTone {
  if (r.status === 'checked_in') {
    if (r.checkInTiming === 'late') return 'blue'
    if (r.checkInTiming === 'early_override') return 'red'
    return 'gold'
  }
  if (r.checkInEligibility === 'early') return 'red'
  if (r.checkInEligibility === 'late') return 'blue'
  return 'neutral'
}

const TONE_CLASS: Record<CheckInTone, { status: string; button: string; pill: string }> = {
  gold: {
    status: 'font-medium text-dc-accent-hover',
    button: 'border-dc-accent-border/50 text-dc-accent-hover hover:bg-dc-accent-muted',
    pill: 'border-dc-accent-border/45 bg-dc-accent-muted text-dc-accent-hover',
  },
  blue: {
    status: 'font-medium text-sky-800',
    button: 'border-sky-400 text-sky-800 hover:bg-sky-100',
    pill: 'border-sky-400 bg-sky-100 text-sky-800',
  },
  red: {
    status: 'font-medium text-red-700',
    button: 'border-red-400 text-red-700 hover:bg-red-100',
    pill: 'border-red-400 bg-red-100 text-red-700',
  },
  neutral: {
    status: '',
    button: 'border-emerald-300 text-emerald-700 hover:bg-emerald-100',
    pill: '',
  },
}

type PolicyDoc = { id: string; kind: string; version: number; title: string; publishedAt: string | null }

const STATUSES = ['', 'imported', 'pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in'] as const

const VETTING = ['none', 'pending', 'approved', 'rejected', 'hold'] as const

const PAGE_SIZE = 50

const PAYMENT_STATUSES = ['', 'paid', 'unpaid', 'partial', 'refunded', 'comp', 'pending', 'waived'] as const

type RegistrantsListResponse = {
  registrants: RegRow[]
  total: number
  limit: number
  offset: number
}

const STATUS_LABELS: Record<string, string> = {
  imported: 'Imported',
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  waitlisted: 'Waitlisted',
  checked_in: 'On-site',
}

function formatRegistrantStatus(r: RegRow) {
  if (r.status === 'checked_in') {
    const tone = rowCheckInTone(r)
    return <span className={TONE_CLASS[tone].status}>{checkInTimingLabel(r.checkInTiming)}</span>
  }
  if (r.checkInEligibility === 'early') {
    return <span className={TONE_CLASS.red.status}>Early — not on-site</span>
  }
  if (r.checkInEligibility === 'late') {
    return <span className={TONE_CLASS.blue.status}>Late window</span>
  }
  return STATUS_LABELS[r.status] ?? r.status
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      q = !q
      continue
    }
    if (!q && c === ',') {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur.trim())
  return out
}

function parseRegistrantCsv(text: string): { rows: Record<string, unknown>[] } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row')
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const col = (...aliases: string[]) => {
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '_')
    for (const a of aliases) {
      const i = header.indexOf(norm(a))
      if (i >= 0) return i
    }
    return -1
  }
  const iName = col('name', 'scene_display_name', 'display_name', 'scenename')
  const iCat = col('category', 'category_name', 'ticket', 'ticket_type', 'type')
  const iEmail = col('email')
  const iLegal = col('legal_name', 'legalname')
  const iExtSrc = col('external_source', 'source')
  const iExtId = col('external_id', 'externalid')
  const iPay = col('payment_status', 'imported_payment_status', 'importedpaymentstatus')
  if (iName < 0 || iCat < 0) {
    throw new Error('CSV must include name and category columns (e.g. name, category)')
  }
  const rows: Record<string, unknown>[] = []
  for (let li = 1; li < lines.length; li++) {
    const cells = splitCsvLine(lines[li])
    const sceneDisplayName = (cells[iName] ?? '').trim()
    const categoryName = (cells[iCat] ?? '').trim()
    if (!sceneDisplayName) continue
    const row: Record<string, unknown> = { sceneDisplayName, categoryName }
    if (iEmail >= 0 && cells[iEmail]?.trim()) row.email = cells[iEmail].trim()
    if (iLegal >= 0 && cells[iLegal]?.trim()) row.legalName = cells[iLegal].trim()
    if (iExtSrc >= 0 && cells[iExtSrc]?.trim()) row.externalSource = cells[iExtSrc].trim()
    if (iExtId >= 0 && cells[iExtId]?.trim()) row.externalId = cells[iExtId].trim()
    if (iPay >= 0 && cells[iPay]?.trim()) row.importedPaymentStatus = cells[iPay].trim()
    rows.push(row)
  }
  if (!rows.length) throw new Error('No data rows parsed from CSV')
  return { rows }
}

export function RegistrantsPanel({
  eventSlug,
  readOnly,
  organizerRole,
}: {
  eventSlug: string
  readOnly: boolean
  organizerRole: OrganizerRoleForClient | null
}) {
  const [rows, setRows] = useState<RegRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [status, setStatus] = useState('')
  const [vettingFilter, setVettingFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [selected, setSelected] = useState<RegRow | null>(null)
  const [detailTab, setDetailTab] = useState<'general' | 'vetting' | 'answers' | 'payment' | 'tags'>('general')
  const [detailStatus, setDetailStatus] = useState('')
  const [detailCategoryId, setDetailCategoryId] = useState('')
  const [detailNotes, setDetailNotes] = useState('')
  const [detailPronouns, setDetailPronouns] = useState('')
  const [detailVettingStatus, setDetailVettingStatus] = useState<(typeof VETTING)[number]>('none')
  const [detailVettingSafety, setDetailVettingSafety] = useState('')
  const [policyDocs, setPolicyDocs] = useState<PolicyDoc[]>([])
  const [policyPick, setPolicyPick] = useState<Record<string, boolean>>({})
  const [detailPaymentStatus, setDetailPaymentStatus] = useState('')
  const [detailAnswers, setDetailAnswers] = useState<Record<string, unknown>>({})
  const [detailTagIds, setDetailTagIds] = useState<string[]>([])
  const [registrantTags, setRegistrantTags] = useState<{ id: string; name: string }[]>([])
  const [formQuestions, setFormQuestions] = useState<
    { id: string; label: string; type: string; optionsJson: unknown }[]
  >([])
  const [linkBusy, setLinkBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null)
  const { ask, dialog } = useConfirmDialog()

  const showInternal = organizerRole != null && organizerRoleCanSeeRegistrantInternalNotes(organizerRole)
  const showVettingSafety = organizerRole != null && organizerRoleCanEditVettingSafetyNotes(organizerRole)

  async function openRow(r: RegRow) {
    setSelected(r)
    setDetailTab('general')
    setDetailStatus(r.status)
    setDetailCategoryId(r.categoryId)
    setDetailNotes(r.internalNotes ?? '')
    setDetailPronouns(r.pronouns ?? '')
    setDetailVettingStatus((r.vettingStatus as (typeof VETTING)[number]) ?? 'none')
    setDetailVettingSafety(r.vettingSafetyNotes ?? '')
    setPolicyPick({})
    setDetailPaymentStatus('')
    setDetailAnswers({})
    setDetailTagIds([])
    try {
      const [res, polRes, tagsRes, formRes] = await Promise.all([
        organizerDancecardFetch<{
          registrant: {
            categoryId: string
            status: string
            internalNotes: string | null
            pronouns: string | null
            vettingStatus: string
            vettingSafetyNotes: string | null
            importedPaymentStatus: string | null
            answers?: Record<string, unknown>
            tagIds?: string[]
          }
        }>(eventSlug, `/registrants/${r.id}`),
        organizerDancecardFetch<{ documents: PolicyDoc[] }>(eventSlug, '/policy-documents').catch(() => ({
          documents: [] as PolicyDoc[],
        })),
        organizerDancecardFetch<{ tags: { id: string; name: string; scope: string }[] }>(eventSlug, '/tags').catch(
          () => ({ tags: [] }),
        ),
        organizerDancecardFetch<{
          form: null | { questions: { id: string; label: string; type: string; optionsJson: unknown }[] }
        }>(eventSlug, '/registration-form').catch(() => ({ form: null })),
      ])
      setDetailStatus(res.registrant.status)
      setDetailCategoryId(res.registrant.categoryId ?? r.categoryId)
      setDetailNotes(res.registrant.internalNotes ?? '')
      setDetailPronouns(res.registrant.pronouns ?? '')
      setDetailVettingStatus((res.registrant.vettingStatus as (typeof VETTING)[number]) ?? 'none')
      setDetailVettingSafety(res.registrant.vettingSafetyNotes ?? '')
      setDetailPaymentStatus(res.registrant.importedPaymentStatus ?? '')
      setDetailAnswers(res.registrant.answers ?? {})
      setDetailTagIds(res.registrant.tagIds ?? [])
      setRegistrantTags((tagsRes.tags ?? []).filter((t) => t.scope === 'registrant').map((t) => ({ id: t.id, name: t.name })))
      setFormQuestions(formRes.form?.questions ?? [])
      setPolicyDocs((polRes.documents ?? []).filter((d) => d.publishedAt))
    } catch {
      setPolicyDocs([])
      setRegistrantTags([])
      setFormQuestions([])
    }
  }

  async function linkAccount() {
    if (!selected || readOnly) return
    setLinkBusy(true)
    setErr(null)
    try {
      const res = await organizerDancecardFetch<{
        registrant: { personId: string | null }
        linkedPerson: { sceneName: string }
      }>(eventSlug, `/registrants/${selected.id}/link-account`, { method: 'POST' })
      await load()
      setSelected((s) => (s ? { ...s, personId: res.registrant.personId } : s))
      setErr(null)
      setCheckInSuccess(`Linked to roster person: ${res.linkedPerson.sceneName}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Link failed')
    } finally {
      setLinkBusy(false)
    }
  }

  const loadCategories = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<{ categories: { id: string; name: string }[] }>(
        eventSlug,
        '/registration-categories',
      )
      setCategories(res.categories ?? [])
    } catch {
      setCategories([])
    }
  }, [eventSlug])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const registrantsQueryPath = useCallback(
    (pageOffset: number) => {
      const qs = new URLSearchParams()
      qs.set('limit', String(PAGE_SIZE))
      qs.set('offset', String(pageOffset))
      if (status) qs.set('status', status)
      if (vettingFilter) qs.set('vetting', vettingFilter)
      if (categoryFilter) qs.set('categoryId', categoryFilter)
      if (q.trim()) qs.set('q', q.trim())
      return `/registrants?${qs}`
    },
    [status, vettingFilter, categoryFilter, q],
  )

  const load = useCallback(async () => {
    setErr(null)
    setLoadFailed(false)
    setLoading(true)
    try {
      const res = await organizerDancecardFetch<RegistrantsListResponse>(eventSlug, registrantsQueryPath(0))
      setRows(res.registrants ?? [])
      setTotal(res.total ?? 0)
    } catch (e) {
      setLoadFailed(true)
      setRows([])
      setTotal(0)
      setErr(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [eventSlug, registrantsQueryPath])

  const loadMore = useCallback(async () => {
    if (loadingMore || rows.length >= total) return
    setLoadingMore(true)
    setErr(null)
    try {
      const res = await organizerDancecardFetch<RegistrantsListResponse>(
        eventSlug,
        registrantsQueryPath(rows.length),
      )
      setRows((prev) => [...prev, ...(res.registrants ?? [])])
      setTotal(res.total ?? 0)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load more')
    } finally {
      setLoadingMore(false)
    }
  }, [eventSlug, registrantsQueryPath, loadingMore, rows.length, total])

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 200)
    return () => window.clearTimeout(t)
  }, [load])

  async function exportCsv() {
    const url = `/api/organizer/dancecard/${encodeURIComponent(eventSlug)}/registrants/export`
    const res = await fetch(url, { credentials: 'include' })
    const text = await res.text()
    if (!res.ok) {
      setErr(text.slice(0, 200))
      return
    }
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `registrants-${eventSlug}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function runImport(json: string) {
    if (readOnly) return
    let body: unknown
    try {
      body = JSON.parse(json)
    } catch {
      setErr('Import body must be JSON: { rows: [...] }')
      return
    }
    setBusy(true)
    try {
      const res = await organizerDancecardFetch<{ created: number; updated?: number; errors: string[] }>(
        eventSlug,
        '/registrants/import',
        {
          method: 'POST',
          body: JSON.stringify(body),
        },
      )
      setErr(res.errors?.length ? res.errors.join('\n') : null)
      await load()
      const u = res.updated ?? 0
      setImportSuccess(`Imported ${res.created} new, updated ${u}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  async function saveDetail() {
    if (!selected || readOnly) return
    setBusy(true)
    try {
      const policyDocumentIds = Object.entries(policyPick)
        .filter(([, v]) => v)
        .map(([id]) => id)
      const patch: Record<string, unknown> = {
        status: detailStatus,
        categoryId: detailCategoryId || undefined,
        pronouns: detailPronouns.trim() || null,
        vettingStatus: detailVettingStatus,
      }
      if (showInternal) patch.internalNotes = detailNotes || null
      if (showVettingSafety) patch.vettingSafetyNotes = detailVettingSafety || null
      if (policyDocumentIds.length) patch.policyDocumentIds = policyDocumentIds
      if (detailTab === 'payment' || detailTab === 'general') {
        patch.importedPaymentStatus = detailPaymentStatus.trim() || null
      }
      if (detailTab === 'answers') patch.answers = detailAnswers
      if (detailTab === 'tags') patch.tagIds = detailTagIds

      const res = await organizerDancecardFetch<{ registrant: RegRow }>(eventSlug, `/registrants/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      const updated = mergeRegistrantRow(selected, res.registrant)
      setSelected(updated)
      setDetailStatus(updated.status)
      setDetailCategoryId(updated.categoryId)
      setRows((prev) => prev.map((row) => (row.id === updated.id ? mergeRegistrantRow(row, updated) : row)))
      if (updated.status === 'waitlisted' && detailStatus !== 'waitlisted' && detailStatus !== 'cancelled') {
        setImportSuccess('Saved. Category is at capacity — status set to waitlisted.')
      }
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function mergeRegistrantRow(prev: RegRow, next: RegRow): RegRow {
    return { ...prev, ...next, categoryName: next.categoryName ?? prev.categoryName }
  }

  async function quickCheckIn(
    id: string,
    e: { stopPropagation(): void },
    earlyOverride = false,
  ) {
    e.stopPropagation()
    if (readOnly) return
    const row = rows.find((r) => r.id === id)
    if (row?.status === 'checked_in') return
    setErr(null)
    setCheckInSuccess(null)
    try {
      const res = await organizerDancecardFetch<{ registrant: RegRow }>(eventSlug, `/registrants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'checked_in', earlyCheckInOverride: earlyOverride }),
      })
      const updated = res.registrant
      if (updated.status !== 'checked_in') {
        setErr(
          `Check-in did not stick — status is still "${STATUS_LABELS[updated.status] ?? updated.status}".`,
        )
        return
      }
      setRows((prev) => prev.map((r) => (r.id === id ? mergeRegistrantRow(r, updated) : r)))
      if (selected?.id === id) {
        setSelected((s) => (s ? mergeRegistrantRow(s, updated) : s))
        setDetailStatus('checked_in')
      }
      if (status === 'confirmed') setStatus('')
      const tone = rowCheckInTone(updated)
      const toneNote =
        updated.checkInTiming === 'late'
          ? ' (late window)'
          : updated.checkInTiming === 'early_override'
            ? ' (early override)'
            : ''
      setCheckInSuccess(`${updated.sceneDisplayName} marked on-site${toneNote}.`)
    } catch (err2) {
      if (err2 instanceof OrganizerApiError && err2.status === 409) {
        try {
          const body = JSON.parse(err2.body) as { code?: string; validFrom?: string | null }
          if (body.code === 'EARLY_CHECK_IN') {
            const from = body.validFrom ? ` Ticket check-in opens ${body.validFrom}.` : ''
            const ok = await ask({
              title: 'Early check-in',
              message: `${row?.sceneDisplayName ?? 'This attendee'} is before their ticket check-in window.${from} Override and check them in anyway?`,
              confirmLabel: 'Override & check in',
              destructive: true,
            })
            if (ok) return quickCheckIn(id, e, true)
            return
          }
        } catch {
          /* fall through */
        }
      }
      setErr(err2 instanceof Error ? err2.message : 'Check-in failed')
    }
  }

  return (
    <div className="space-y-4">
      {dialog}
      <header>
        <h2 className="font-serif text-xl text-dc-text sm:text-2xl">{copy.signups}</h2>
      </header>
      <div className="rounded-xl border border-dc-border bg-dc-elevated-muted px-4 py-3">
        <p className="text-sm leading-relaxed text-dc-muted">
          {copy.signups} are everyone who signed up through your registration form or import. Each row is a signup record
          (ticket category, status, check-in). When synced or linked, the same person also appears in the{' '}
          <Link
            href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=people&${PEOPLE_SUB_TAB_PARAM}=roster`}
            className="text-dc-accent hover:underline"
          >
            {copy.roster}
          </Link>{' '}
          for program and staff assignments.
        </p>
        <p className="mt-2 text-xs text-dc-muted">
          Use {copy.roster} for roles on classes and shifts; use {copy.signups} for signup status, vetting fields, and
          exports. Open any signup and use the <strong className="font-medium text-dc-text">General</strong> tab to change{' '}
          <strong className="font-medium text-dc-text">registration category</strong> (Weekend pass, Staff, Volunteer,
          etc.) and <strong className="font-medium text-dc-text">status</strong> — no comp or staff registration code
          required.
        </p>
      </div>
      {importSuccess ? (
        <InlineSuccessBanner message={importSuccess} onDismiss={() => setImportSuccess(null)} />
      ) : null}
      {checkInSuccess ? (
        <InlineSuccessBanner message={checkInSuccess} onDismiss={() => setCheckInSuccess(null)} />
      ) : null}
      {err ? <p className="text-sm text-red-700 whitespace-pre-wrap">{err}</p> : null}
      <p className="text-xs text-dc-muted">
        Check-in colors: <span className="text-dc-accent-hover">gold on-site</span> ·{' '}
        <span className="text-sky-700">blue late</span> · <span className="text-red-700">red early (override)</span>.
        Set per-ticket windows in Registration → ticket categories.
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <select
          className="shrink-0 rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s ? (STATUS_LABELS[s] ?? s) : 'All statuses'}
            </option>
          ))}
        </select>
        <select
          className="shrink-0 rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
          value={vettingFilter}
          onChange={(e) => setVettingFilter(e.target.value)}
        >
          <option value="">All vetting</option>
          {VETTING.map((v) => (
            <option key={v} value={v}>
              {v.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          className="shrink-0 max-w-[12rem] rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All ticket types</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="min-w-[10rem] shrink-0 flex-1 rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text"
          placeholder="Search name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {!readOnly ? (
          <button
            type="button"
            className="shrink-0 rounded-full border border-dc-border px-4 py-2 text-sm text-dc-text hover:bg-dc-surface-muted"
            onClick={() => void exportCsv()}
          >
            Export CSV
          </button>
        ) : null}
      </div>
      {!readOnly ? (
        <>
          <details className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3 text-sm text-dc-muted">
            <summary className="cursor-pointer text-dc-accent">Import CSV</summary>
            <p className="mt-2 text-xs text-dc-muted">
              Header row required. Columns: <strong>name</strong>, <strong>category</strong> (must match a registration
              category), optional email, legal_name, payment_status, external_source, external_id.
            </p>
            <textarea
              className="mt-2 w-full min-h-[100px] rounded border border-dc-border bg-dc-surface-muted p-2 font-mono text-xs text-dc-text"
              placeholder={'name,category,email\nAlex,Full Weekend,a@b.co'}
              id="dc-import-csv"
            />
            <button
              type="button"
              disabled={busy}
              className="mt-2 rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
              onClick={() => {
                const el = document.getElementById('dc-import-csv') as HTMLTextAreaElement | null
                if (!el) return
                try {
                  const parsed = parseRegistrantCsv(el.value)
                  void runImport(JSON.stringify(parsed))
                } catch (e) {
                  setErr(e instanceof Error ? e.message : 'CSV parse error')
                }
              }}
            >
              Run CSV import
            </button>
          </details>
          <details className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3 text-sm text-dc-muted">
          <summary className="cursor-pointer text-dc-accent">Import JSON</summary>
          <p className="mt-2 text-xs text-dc-muted">
            Body shape: {'{'} &quot;rows&quot;: [ {'{'} &quot;sceneDisplayName&quot;, &quot;categoryName&quot; or
            &quot;categoryId&quot;, optional &quot;email&quot;, &quot;status&quot; {'}'} ] {'}'}
          </p>
          <textarea
            className="mt-2 w-full min-h-[100px] rounded border border-dc-border bg-dc-surface-muted p-2 font-mono text-xs text-dc-text"
            placeholder='{"rows":[{"sceneDisplayName":"Alex","categoryName":"Full Weekend","email":"a@b.co"}]}'
            id="dc-import-json"
          />
          <button
            type="button"
            disabled={busy}
            className="mt-2 rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
            onClick={() => {
              const el = document.getElementById('dc-import-json') as HTMLTextAreaElement | null
              if (el) void runImport(el.value)
            }}
          >
            Run import
          </button>
        </details>
        </>
      ) : null}
      {loading ? <p className="text-sm text-dc-muted">Loading signups…</p> : null}
      {loadFailed && err ? <p className="text-sm text-red-700">{err}</p> : null}
      {total > 0 ? (
        <p className="text-xs text-dc-muted">
          Showing {rows.length} of {total} signup{total === 1 ? '' : 's'}
        </p>
      ) : null}
      <RegistrantsMasterDetail
        eventSlug={eventSlug}
        rows={rows}
        readOnly={readOnly}
        selectedId={selected?.id ?? null}
        onSelect={(r) => void openRow(r)}
        renderPersonRosterLink={(r) =>
          r.personId ? (
            <Link
              href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=people&${PEOPLE_SUB_TAB_PARAM}=roster`}
              className="text-dc-accent hover:underline"
            >
              Open linked person in {copy.roster} →
            </Link>
          ) : null
        }
        getCell={(r, col) => {
          if (col === 'category') return r.categoryName ?? '-'
          if (col === 'status') return formatRegistrantStatus(r)
          if (col === 'vetting') return r.vettingStatus
          if (col === 'email') return r.email ?? '-'
          if (col === 'external')
            return r.externalSource || r.externalId
              ? `${r.externalSource ?? '-'} / ${r.externalId ?? '-'}`
              : '-'
          return '-'
        }}
        renderCheckIn={
          readOnly
            ? undefined
            : (r) => {
                const tone = rowCheckInTone(r)
                const cls = TONE_CLASS[tone]
                if (r.status === 'checked_in') {
                  return (
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-medium ${cls.pill}`}
                    >
                      {checkInTimingLabel(r.checkInTiming)}
                    </span>
                  )
                }
                return (
                  <button
                    type="button"
                    className={`rounded-full border px-2 py-1 text-xs font-medium ${cls.button}`}
                    onClick={(e) => void quickCheckIn(r.id, e)}
                  >
                    {r.checkInEligibility === 'early'
                      ? 'Check in (early)'
                      : r.checkInEligibility === 'late'
                        ? 'Check in (late)'
                        : 'Check in'}
                  </button>
                )
              }
        }
        renderDetail={() =>
          selected ? (
            <>
              <h3 className="font-serif text-lg text-dc-text">{selected.sceneDisplayName}</h3>
              <p className="text-xs text-dc-muted">{selected.id}</p>
              <div className="mt-3 flex flex-wrap gap-1 border-b border-dc-border pb-2">
                {(
                  [
                    ['general', 'General'],
                    ['answers', 'Answers'],
                    ['payment', 'Payment'],
                    ['tags', 'Tags'],
                    ['vetting', 'Vetting'],
                  ] as const
                ).map(([t, label]) => (
                  <button
                    key={t}
                    type="button"
                    className={
                      detailTab === t
                        ? 'rounded-full bg-dc-accent/20 px-3 py-1 text-xs text-dc-accent'
                        : 'rounded-full px-3 py-1 text-xs text-dc-muted'
                    }
                    onClick={() => setDetailTab(t)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {detailTab === 'general' ? (
                <div className="mt-3 space-y-3 text-sm">
                  <label className="block text-xs uppercase text-dc-muted">
                    Registration category
                    <select
                      className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2 text-dc-text"
                      disabled={readOnly}
                      value={detailCategoryId}
                      onChange={(e) => setDetailCategoryId(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-[11px] leading-snug text-dc-muted">
                    Change ticket type here for anyone — including people who signed up under a different category or
                    without a staff/comp code. For shift assignments, also add them on{' '}
                    <strong className="font-medium text-dc-text">Staff roster (overview)</strong>.
                  </p>
                  <label className="block text-xs uppercase text-dc-muted">
                    Status
                    <select
                      className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2 text-dc-text"
                      disabled={readOnly}
                      value={detailStatus}
                      onChange={(e) => setDetailStatus(e.target.value)}
                    >
                      {(['imported', 'pending', 'confirmed', 'cancelled', 'waitlisted', 'checked_in'] as const).map(
                        (s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s] ?? s}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block text-xs uppercase text-dc-muted">
                    Pronouns
                    <input
                      className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2"
                      disabled={readOnly}
                      value={detailPronouns}
                      onChange={(e) => setDetailPronouns(e.target.value)}
                    />
                  </label>
                  {showInternal ? (
                    <textarea
                      className="min-h-[80px] w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2"
                      disabled={readOnly}
                      value={detailNotes}
                      onChange={(e) => setDetailNotes(e.target.value)}
                      placeholder="Internal notes"
                    />
                  ) : null}
                  {!selected.personId && selected.email && !readOnly ? (
                    <button
                      type="button"
                      disabled={linkBusy}
                      className="w-full rounded-full border border-dc-accent-border px-3 py-2 text-xs text-dc-accent hover:bg-dc-accent-muted disabled:opacity-40"
                      onClick={() => void linkAccount()}
                    >
                      {linkBusy ? 'Linking…' : 'Link to roster person by email'}
                    </button>
                  ) : null}
                </div>
              ) : detailTab === 'answers' ? (
                <div className="mt-3 space-y-3 text-sm">
                  {formQuestions.length === 0 ? (
                    <p className="text-xs text-dc-muted">No registration form questions configured.</p>
                  ) : (
                    formQuestions.map((q) => (
                      <label key={q.id} className="block text-xs text-dc-muted">
                        {q.label}
                        <input
                          className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2 text-sm"
                          disabled={readOnly}
                          value={
                            typeof detailAnswers[q.id] === 'string' ||
                            typeof detailAnswers[q.id] === 'number'
                              ? String(detailAnswers[q.id])
                              : detailAnswers[q.id] != null
                                ? JSON.stringify(detailAnswers[q.id])
                                : ''
                          }
                          onChange={(e) => setDetailAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        />
                      </label>
                    ))
                  )}
                </div>
              ) : detailTab === 'payment' ? (
                <div className="mt-3 space-y-3 text-sm">
                  <label className="block text-xs uppercase text-dc-muted">
                    Imported payment status
                    <select
                      className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2"
                      disabled={readOnly}
                      value={detailPaymentStatus}
                      onChange={(e) => setDetailPaymentStatus(e.target.value)}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s || 'none'} value={s}>
                          {s ? s : '— not set —'}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : detailTab === 'tags' ? (
                <div className="mt-3 space-y-2 text-sm">
                  {registrantTags.length === 0 ? (
                    <p className="text-xs text-dc-muted">No registrant-scoped tags.</p>
                  ) : (
                    registrantTags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2 text-dc-text">
                        <input
                          type="checkbox"
                          disabled={readOnly}
                          checked={detailTagIds.includes(tag.id)}
                          onChange={(e) => {
                            setDetailTagIds((ids) =>
                              e.target.checked ? [...ids, tag.id] : ids.filter((id) => id !== tag.id),
                            )
                          }}
                        />
                        {tag.name}
                      </label>
                    ))
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <select
                    className="w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2"
                    disabled={readOnly}
                    value={detailVettingStatus}
                    onChange={(e) => setDetailVettingStatus(e.target.value as (typeof VETTING)[number])}
                  >
                    {VETTING.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {showVettingSafety ? (
                    <textarea
                      className="min-h-[100px] w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2"
                      disabled={readOnly}
                      value={detailVettingSafety}
                      onChange={(e) => setDetailVettingSafety(e.target.value)}
                    />
                  ) : null}
                </div>
              )}
              {!readOnly ? (
                <button
                  type="button"
                  disabled={busy}
                  className="mt-4 w-full rounded-full bg-dc-accent py-2 text-sm font-semibold text-dc-accent-foreground disabled:opacity-40"
                  onClick={() => void saveDetail()}
                >
                  Save
                </button>
              ) : null}
            </>
          ) : null
        }
      />
      {rows.length < total ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            className="rounded-full border border-dc-border px-4 py-2 text-sm text-dc-text hover:bg-dc-surface-muted disabled:opacity-40"
            onClick={() => void loadMore()}
          >
            {loadingMore ? 'Loading…' : `Load more (${rows.length} of ${total})`}
          </button>
        </div>
      ) : null}
    </div>
  )
}
