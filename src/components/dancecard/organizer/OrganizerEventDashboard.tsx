'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { invalidateOrganizerDancecardCache, organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { SetupTaskList } from '@/components/dancecard/organizer/home/SetupTaskList'
import type { EventSettingsEventDto } from '@/components/dancecard/organizer/settings/EventSettingsEventDto'
import { WIZARD_STORAGE_KEY } from '@/components/dancecard/organizer/settings/eventSettingsConfig'
import type { OrganizerTab, PeopleSubTab } from '@/components/dancecard/organizer/shell/organizerNavConfig'
import type { ProgramSlotRow } from '@/lib/dancecard/organizerProgramSlotDto'
import { supportCopy } from '@/lib/dancecard/supportCopy'
import {
  readImportSkipped,
  resolveSetupTasks,
  setupReadinessPercent,
  type ResolvedSetupTask,
} from '@/lib/dancecard/resolveSetupTasks'
import { SETUP_LIFECYCLE_COLLAPSED_KEY } from '@/lib/dancecard/setupTasks'
import type { ReadinessCheck } from '@/lib/dancecard/readinessTypes'
import { LiveOpsConsolePanel } from '@/components/dancecard/organizer/LiveOpsConsolePanel'
import { Panel } from '@/components/dancecard/ui/Panel'
import { cn } from '@/lib/cn'

function severityStyles(sev: ReadinessCheck['severity']) {
  if (sev === 'warning') return 'border-dc-warning/30 bg-dc-warning-muted text-dc-warning'
  if (sev === 'info') return 'border-dc-border bg-dc-surface-muted text-dc-muted'
  return 'border-dc-success/25 bg-dc-success-muted text-dc-success'
}

function ActionCard({
  check,
  readOnly,
  onNavigateTab,
}: {
  check: ReadinessCheck
  readOnly?: boolean
  onNavigateTab: (
    tab: OrganizerTab,
    opts?: { peopleTab?: PeopleSubTab; settingsPanel?: string; publishFilter?: 'draft' },
  ) => void
}) {
  const action = check.action
  return (
    <Panel className={cn('!p-4', severityStyles(check.severity))}>
      <p className="font-medium text-dc-text">{check.title}</p>
      {check.detail ? <p className="mt-1.5 text-sm leading-relaxed opacity-90">{check.detail}</p> : null}
      {action && !readOnly ? (
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-dc-accent hover:underline"
          onClick={() =>
            onNavigateTab(action.tab as OrganizerTab, {
              peopleTab: action.peopleTab,
              settingsPanel: action.settingsPanel,
            })
          }
        >
          {action.label} →
        </button>
      ) : null}
    </Panel>
  )
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dc-border bg-dc-elevated px-4 py-3">
      <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-dc-text">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-dc-muted">{hint}</p> : null}
    </div>
  )
}

export function OrganizerEventDashboard({
  eventSlug,
  eventTitle,
  event: eventFromBootstrap,
  slots,
  readOnly,
  onNavigateTab,
}: {
  eventSlug: string
  eventTitle: string
  /** From shell bootstrap — avoids a duplicate GET /event on home load. */
  event?: EventSettingsEventDto | null
  slots: ProgramSlotRow[]
  readOnly?: boolean
  onNavigateTab: (
    tab: OrganizerTab,
    opts?: { peopleTab?: PeopleSubTab; settingsPanel?: string; publishFilter?: 'draft' },
  ) => void
}) {
  const [summaryChecks, setSummaryChecks] = useState<ReadinessCheck[] | null>(null)
  const [fullChecks, setFullChecks] = useState<ReadinessCheck[] | null>(null)
  const [fullLoading, setFullLoading] = useState(false)
  const [fullErr, setFullErr] = useState<string | null>(null)
  const [summaryErr, setSummaryErr] = useState<string | null>(null)
  const fullRequestedRef = useRef(false)
  const event = eventFromBootstrap
  const [tasksCollapsed, setTasksCollapsed] = useState(false)

  const checks = fullChecks ?? summaryChecks

  const unpublishedCount = useMemo(() => slots.filter((s) => !s.isPublished).length, [slots])

  const wizardDone = useMemo(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(WIZARD_STORAGE_KEY(eventSlug)) === '1'
    } catch {
      return false
    }
  }, [eventSlug])

  const loadSummary = useCallback(async (force = false) => {
    setSummaryErr(null)
    try {
      if (force) invalidateOrganizerDancecardCache(eventSlug, '/readiness/summary')
      const res = await organizerDancecardFetch<{ checks: ReadinessCheck[] }>(eventSlug, '/readiness/summary')
      setSummaryChecks(res.checks)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Could not load overview'
      setSummaryErr(
        raw === 'Internal error'
          ? supportCopy.dashboardLoadFailed
          : raw,
      )
    }
  }, [eventSlug])

  const loadFull = useCallback(
    async (force = false) => {
      setFullErr(null)
      setFullLoading(true)
      fullRequestedRef.current = true
      try {
        if (force) invalidateOrganizerDancecardCache(eventSlug, '/readiness')
        const res = await organizerDancecardFetch<{ checks: ReadinessCheck[] }>(eventSlug, '/readiness')
        setFullChecks(res.checks)
      } catch (e) {
        const raw = e instanceof Error ? e.message : 'Could not run full pre-flight checks'
        setFullErr(
          raw === 'Internal error'
            ? supportCopy.preflightFailed
            : raw,
        )
      } finally {
        setFullLoading(false)
      }
    },
    [eventSlug],
  )

  const refreshAll = useCallback(
    async (force = false) => {
      await loadSummary(force)
      if (fullChecks || fullRequestedRef.current) {
        await loadFull(force)
      }
    },
    [loadSummary, loadFull, fullChecks],
  )

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  useEffect(() => {
    if (!summaryChecks || fullChecks || fullRequestedRef.current) return
    const t = window.setTimeout(() => {
      void loadFull()
    }, 400)
    return () => window.clearTimeout(t)
  }, [summaryChecks, fullChecks, loadFull])

  useEffect(() => {
    try {
      setTasksCollapsed(localStorage.getItem(SETUP_LIFECYCLE_COLLAPSED_KEY(eventSlug)) === '1')
    } catch {
      setTasksCollapsed(false)
    }
  }, [eventSlug])

  const setupTasks: ResolvedSetupTask[] = useMemo(() => {
    if (!checks) return []
    return resolveSetupTasks({
      event: event ?? null,
      checks,
      slotCount: slots.length,
      unpublishedCount,
      wizardDone,
      importSkipped: readImportSkipped(eventSlug),
      summaryOnly: !fullChecks,
    })
  }, [checks, event, slots.length, unpublishedCount, wizardDone, eventSlug, fullChecks])

  const readinessPct = setupReadinessPercent(setupTasks)
  const essentialIncomplete = setupTasks.filter((t) => t.group === 'essential' && t.status !== 'complete').length
  const allEssentialDone = essentialIncomplete === 0 && setupTasks.length > 0

  useEffect(() => {
    if (!allEssentialDone) return
    try {
      localStorage.setItem(SETUP_LIFECYCLE_COLLAPSED_KEY(eventSlug), '1')
      setTasksCollapsed(true)
    } catch {
      /* ignore */
    }
  }, [allEssentialDone, eventSlug])

  const err = summaryErr

  if (err) {
    return (
      <Panel className="border-dc-danger/30 bg-dc-danger-muted/40">
        <p className="font-medium text-dc-danger">Home could not load</p>
        <p className="mt-2 text-sm text-dc-muted">{err}</p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-dc-border px-4 py-2 text-sm text-dc-text hover:border-dc-accent-border"
          onClick={() => void loadSummary(true)}
        >
          Try again
        </button>
      </Panel>
    )
  }

  if (!checks) {
    return <p className="text-sm text-dc-muted">Loading home…</p>
  }

  const warnings = checks.filter((c) => c.severity === 'warning')
  const fixNow = warnings.filter((c) => c.action)
  const later = checks.filter((c) => c.severity === 'info' && c.action)
  const okCount = checks.filter((c) => c.severity === 'ok').length
  const title = eventTitle || eventSlug
  const publishedCount = slots.length - unpublishedCount
  const scanLabel = fullChecks ? 'Full' : 'Quick'
  const displayChecks = fullChecks ?? summaryChecks ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-dc-text sm:text-3xl">Home</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dc-muted">
          Operational center for <span className="text-dc-text">{title}</span>. Complete setup tasks, then use dynamic
          warnings below when something needs attention.
        </p>
      </header>

      <LiveOpsConsolePanel eventSlug={eventSlug} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Setup" value={`${readinessPct}%`} hint="Essential tasks complete" />
        <KpiCard label="Classes" value={String(slots.length)} hint="On program grid" />
        <KpiCard label="Published" value={String(publishedCount)} hint="Visible to attendees" />
        <KpiCard label="Draft" value={String(unpublishedCount)} hint="Hidden from public schedule" />
        <KpiCard
          label="Urgent"
          value={String(warnings.length)}
          hint={warnings.length === 0 ? 'Nothing blocking go-live' : `${scanLabel} readiness warnings`}
        />
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Public dancecard</p>
            <p className="mt-1 text-sm text-dc-muted">
              {event?.status === 'published' ? 'Event is live for attendees.' : 'Event is not published yet.'}
              {!fullChecks && summaryChecks ? (
                <span className="block text-xs text-dc-muted/80">
                  {fullLoading ? 'Running full pre-flight checks…' : 'Showing quick checks — full scan loads in the background.'}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}/door`}
              className="rounded-xl border border-dc-accent-border bg-dc-accent-muted px-4 py-2 text-sm font-semibold text-dc-accent hover:bg-dc-accent-muted/80 hover:text-dc-accent-hover"
            >
              Door mode
            </Link>
            <Link
              href={`/dancecard/${eventSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
            >
              Preview ↗
            </Link>
            <button
              type="button"
              className="rounded-xl border border-dc-border px-4 py-2 text-sm text-dc-muted hover:text-dc-text disabled:opacity-50"
              disabled={fullLoading}
              onClick={() => void loadFull(true)}
            >
              {fullLoading ? 'Scanning…' : fullChecks ? 'Refresh full checks' : 'Run full pre-flight'}
            </button>
            <button
              type="button"
              className="rounded-xl border border-dc-border px-4 py-2 text-sm text-dc-muted hover:text-dc-text"
              onClick={() => void refreshAll(true)}
            >
              Refresh
            </button>
          </div>
        </div>
        {fullErr ? <p className="mt-3 text-xs text-dc-warning">{fullErr}</p> : null}
      </Panel>

      {setupTasks.length > 0 ? (
        <section aria-labelledby="setup-tasks-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="setup-tasks-heading" className="text-sm font-semibold text-dc-text">
                Setup checklist
              </h2>
              <p className="text-xs text-dc-muted">
                {readOnly
                  ? 'Read-only view — you cannot open fix links.'
                  : 'Work through essentials before go-live. Optional items can wait.'}
              </p>
            </div>
            {allEssentialDone ? (
              <button
                type="button"
                className="text-xs font-medium text-dc-accent hover:underline"
                onClick={() => setTasksCollapsed((v) => !v)}
              >
                {tasksCollapsed ? 'Show full list' : 'Collapse list'}
              </button>
            ) : null}
          </div>
          <SetupTaskList
            tasks={setupTasks}
            readOnly={readOnly}
            compact={tasksCollapsed && allEssentialDone}
            onNavigate={onNavigateTab}
          />
        </section>
      ) : null}

      {fixNow.length > 0 ? (
        <section aria-labelledby="fix-now-heading">
          <h2 id="fix-now-heading" className="mb-1 text-sm font-semibold text-dc-text">
            Needs attention
          </h2>
          <p className="mb-3 text-xs text-dc-muted">
            {fullChecks
              ? 'Dynamic warnings from your live schedule and roster.'
              : 'Quick checks — run full pre-flight for schedule conflicts, agreements, and presenter coverage.'}
          </p>
          <ul className="space-y-2">
            {fixNow.map((c) => (
              <li key={c.id}>
                <ActionCard check={c} readOnly={readOnly} onNavigateTab={onNavigateTab} />
              </li>
            ))}
          </ul>
        </section>
      ) : warnings.length === 0 ? (
        <Panel className="border-dc-success/25 bg-dc-success-muted/30">
          <p className="text-sm font-medium text-dc-success">No urgent warnings</p>
          <p className="mt-1 text-sm text-dc-muted">
            {okCount} automated check{okCount === 1 ? '' : 's'} passed ({scanLabel.toLowerCase()} scan).
            {!fullChecks ? ' Run full pre-flight for conflict and agreement checks.' : null}
          </p>
        </Panel>
      ) : null}

      {later.length > 0 ? (
        <section aria-labelledby="later-heading">
          <h2 id="later-heading" className="mb-1 text-sm font-semibold text-dc-text">
            When you have time
          </h2>
          <ul className="space-y-2">
            {later.map((c) => (
              <li key={c.id}>
                <ActionCard check={c} readOnly={readOnly} onNavigateTab={onNavigateTab} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="group rounded-2xl border border-dc-border bg-dc-elevated-muted/50">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-dc-text marker:content-none [&::-webkit-details-marker]:hidden">
          {scanLabel} readiness scan ({displayChecks.length})
          <span className="ml-2 text-dc-muted group-open:hidden">Show</span>
          <span className="ml-2 text-dc-muted hidden group-open:inline">Hide</span>
        </summary>
        <ul className="max-h-80 space-y-2 overflow-y-auto border-t border-dc-border px-4 py-3">
          {displayChecks.map((c) => (
            <li key={c.id} className={cn('rounded-lg border px-3 py-2 text-sm', severityStyles(c.severity))}>
              <span className="font-medium">{c.title}</span>
              {c.detail ? <p className="mt-0.5 text-xs leading-relaxed opacity-90">{c.detail}</p> : null}
              {c.action && !readOnly ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-dc-accent hover:underline"
                  onClick={() =>
                    onNavigateTab(c.action!.tab as OrganizerTab, {
                      peopleTab: c.action!.peopleTab,
                      settingsPanel: c.action!.settingsPanel,
                    })
                  }
                >
                  {c.action.label}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
