'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AssignmentBoardPanel } from '@/components/dancecard/organizer/AssignmentBoardPanel'
import { ExportsHubPanel } from '@/components/dancecard/organizer/ExportsHubPanel'
import { EventSettingsPanel } from '@/components/dancecard/organizer/EventSettingsPanel'
import { MessagingPanel } from '@/components/dancecard/organizer/MessagingPanel'
import { PeopleHubPanel } from '@/components/dancecard/organizer/PeopleHubPanel'
import { invalidateOrganizerDancecardCache, organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import type { ProgramSlotRow } from '@/lib/dancecard/organizerProgramSlotDto'
import type { OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'
import { ScheduleImportPanel } from '@/components/dancecard/organizer/ScheduleImportPanel'
import { VenueAvailabilityGrid } from '@/components/dancecard/organizer/VenueAvailabilityGrid'
import { OrganizerEventDashboard } from '@/components/dancecard/organizer/OrganizerEventDashboard'
import { IntegrationsPanel } from '@/components/dancecard/organizer/IntegrationsPanel'
import { EventSetupRequired } from '@/components/dancecard/organizer/EventSetupRequired'
import { ProgramTab } from '@/components/dancecard/organizer/program/ProgramTab'
import { OrganizerEventShell } from '@/components/dancecard/organizer/shell/OrganizerEventShell'
import { useOrganizerShellPrefs } from '@/components/dancecard/organizer/shell/useOrganizerShellPrefs'
import { EVENT_SETTINGS_PANEL_PARAM } from '@/components/dancecard/organizer/settings/eventSettingsConfig'
import {
  isOrganizerTab,
  isPeopleSubTab,
  LEGACY_PEOPLE_TABS,
  legacyTabToPeopleSubTab,
  PEOPLE_SUB_TAB_PARAM,
  type OrganizerTab,
  type PeopleSubTab,
} from '@/components/dancecard/organizer/shell/organizerNavConfig'
import { GuideRouter } from '@/components/dancecard/onboarding/GuideRouter'
import { GhostCursorRehearsal } from '@/components/dancecard/organizer/onboarding/GhostCursorRehearsal'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import type { EventSettingsEventDto } from '@/components/dancecard/organizer/settings/EventSettingsEventDto'
import { C2kFromBanner } from '@/components/dancecard/organizer/C2kFromBanner'
import { OrganizerCommandProvider } from '@/components/dancecard/organizer/command/OrganizerCommandContext'
import { SETUP_TASKS } from '@/lib/dancecard/setupTasks'
import { OrganizerCommandShell } from '@/components/dancecard/organizer/OrganizerCommandShell'
import { OrganizerWorkspaceSkeleton } from '@/components/dancecard/organizer/ui'
import { TabContentTransition } from '@/components/dancecard/ui/TabContentTransition'

export function OrganizerDancecardClient({ eventSlug }: { eventSlug: string }) {
  const slug = eventSlug.toLowerCase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<OrganizerTab>('dashboard')
  const [timezone, setTimezone] = useState('America/New_York')
  const [windowStartsAt, setWindowStartsAt] = useState('')
  const [windowEndsAt, setWindowEndsAt] = useState('')
  const [slots, setSlots] = useState<ProgramSlotRow[]>([])
  const [shifts, setShifts] = useState<OrganizerStaffShiftDto[]>([])
  const [eventTitle, setEventTitle] = useState('')
  const [organizerRole, setOrganizerRole] = useState<OrganizerRoleForClient | null>(null)
  const [bootstrapEvent, setBootstrapEvent] = useState<EventSettingsEventDto | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const { wideCanvas, toggleWideCanvas } = useOrganizerShellPrefs(slug)
  const [conflictsPulse, setConflictsPulse] = useState(false)
  const [bootstrapReady, setBootstrapReady] = useState(false)

  const readOnly = organizerRole === 'viewer'
  const hasEventWindow = Boolean(windowStartsAt && windowEndsAt)
  const initialSlotId = searchParams.get('slot')

  const humanizeLoadMessage = useCallback((message: string, context: 'program' | 'staff' | 'event') => {
    if (message === 'Internal error') {
      if (context === 'program') {
        return 'Schedule data failed to load. Program and room tools may be limited until you refresh the page or contact support.'
      }
      if (context === 'staff') {
        return 'Staff shifts could not load. Open Staff shifts to retry, or contact support if the problem continues.'
      }
      return 'Something went wrong loading event data. Try refreshing the page.'
    }
    return message
  }, [])

  const reportNonBlockingError = useCallback(
    (operation: string, error: unknown) => {
      const raw = error instanceof Error ? error.message : `Could not ${operation}`
      const message = humanizeLoadMessage(raw, operation.includes('staff') ? 'staff' : 'event')
      console.error(`[dancecard organizer] ${operation} failed`, { eventSlug: slug, error })
      setNotice(message)
    },
    [humanizeLoadMessage, slug],
  )

  const refreshProgram = useCallback(async () => {
    invalidateOrganizerDancecardCache(slug, '/program-slots')
    invalidateOrganizerDancecardCache(slug, '/bootstrap')
    try {
      const res = await organizerDancecardFetch<{
        slots: ProgramSlotRow[]
        timezone: string
        windowStartsAt: string
        windowEndsAt: string
      }>(slug, '/program-slots')
      setSlots(res.slots)
      setTimezone(res.timezone)
      setWindowStartsAt(res.windowStartsAt)
      setWindowEndsAt(res.windowEndsAt)
      setLoadErr(null)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Could not load program'
      setLoadErr(humanizeLoadMessage(raw, 'program'))
    }
  }, [humanizeLoadMessage, slug])

  const mergeProgramSlot = useCallback((updated: ProgramSlotRow) => {
    setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }, [])

  const refreshStaff = useCallback(async () => {
    invalidateOrganizerDancecardCache(slug, '/staff-shifts')
    invalidateOrganizerDancecardCache(slug, '/bootstrap')
    try {
      const res = await organizerDancecardFetch<{ shifts: OrganizerStaffShiftDto[]; timezone: string }>(
        slug,
        '/staff-shifts',
      )
      setShifts(res.shifts)
      setTimezone(res.timezone)
      setNotice(null)
    } catch (e) {
      reportNonBlockingError('load staff shifts', e)
    }
  }, [reportNonBlockingError, slug])

  const refreshMeta = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<{ event: EventSettingsEventDto; organizerRole: OrganizerRoleForClient }>(
        slug,
        '/event',
      )
      setOrganizerRole(res.organizerRole ?? 'editor')
      setBootstrapEvent(res.event)
      setEventTitle(res.event.eventTitle)
      setNotice(null)
    } catch (e) {
      reportNonBlockingError('load event metadata', e)
    }
  }, [reportNonBlockingError, slug])

  const loadBootstrap = useCallback(async () => {
    invalidateOrganizerDancecardCache(slug)
    setBootstrapReady(false)
    try {
      const res = await organizerDancecardFetch<{
        organizerRole: OrganizerRoleForClient
        event: EventSettingsEventDto
        slots: ProgramSlotRow[]
        shifts: OrganizerStaffShiftDto[]
        timezone: string
        windowStartsAt: string
        windowEndsAt: string
      }>(slug, '/bootstrap')
      setOrganizerRole(res.organizerRole ?? 'editor')
      setBootstrapEvent(res.event)
      setEventTitle(res.event.eventTitle)
      setSlots(res.slots)
      setShifts(res.shifts)
      setTimezone(res.timezone)
      setWindowStartsAt(res.windowStartsAt)
      setWindowEndsAt(res.windowEndsAt)
      setLoadErr(null)
      setNotice(null)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Could not load event'
      setLoadErr(humanizeLoadMessage(raw, 'event'))
    } finally {
      setBootstrapReady(true)
    }
  }, [humanizeLoadMessage, slug])

  useEffect(() => {
    void loadBootstrap()
  }, [loadBootstrap])

  const switchTab = useCallback(
    (
      next: OrganizerTab,
      opts?: {
        slotId?: string | null
        settingsPanel?: string | null
        peopleTab?: PeopleSubTab | null
        publishFilter?: 'draft' | null
      },
    ) => {
      setTab(next)
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', next)
      if (opts?.slotId) params.set('slot', opts.slotId)
      else if (opts?.slotId === null) params.delete('slot')
      if (next === 'people' && opts?.peopleTab) {
        params.set(PEOPLE_SUB_TAB_PARAM, opts.peopleTab)
      } else if (next !== 'people') {
        params.delete(PEOPLE_SUB_TAB_PARAM)
      }
      if (next === 'settings' && opts?.settingsPanel) {
        params.set(EVENT_SETTINGS_PANEL_PARAM, opts.settingsPanel)
      } else if (next !== 'settings') {
        params.delete(EVENT_SETTINGS_PANEL_PARAM)
      }
      if (next === 'program' && opts?.publishFilter === 'draft') {
        params.set('publishFilter', 'draft')
      } else if (next !== 'program' || opts?.publishFilter !== 'draft') {
        params.delete('publishFilter')
      }
      const qs = params.toString()
      const path = `/organizer/dancecard/${slug}`
      const href = qs ? `${path}?${qs}` : path
      router.replace(href, { scroll: false })
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', href)
      }
    },
    [router, searchParams, slug],
  )

  const goVenueSettings = useCallback(() => {
    switchTab('settings', { slotId: null, settingsPanel: 'venue' })
  }, [switchTab])

  useEffect(() => {
    const t = searchParams.get('tab')
    if (isOrganizerTab(t)) setTab(t)
  }, [searchParams])

  useEffect(() => {
    if (!initialSlotId || !slots.length) return
    if (slots.some((s) => s.id === initialSlotId)) return
    setNotice(
      'That activity link is outdated (the schedule may have been reset). Open the session again from the grid or list.',
    )
    switchTab(tab, { slotId: null })
  }, [initialSlotId, slots, switchTab, tab])

  useEffect(() => {
    if (tab !== 'people' && LEGACY_PEOPLE_TABS.includes(tab)) {
      const sub = legacyTabToPeopleSubTab(tab)
      if (!sub) return
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'people')
      params.set(PEOPLE_SUB_TAB_PARAM, sub)
      const qs = params.toString()
      router.replace(qs ? `/organizer/dancecard/${slug}?${qs}` : `/organizer/dancecard/${slug}`, { scroll: false })
      setTab('people')
    }
  }, [router, searchParams, slug, tab])

  const previewRole = (role: 'attendee' | 'staff' | 'safety' | 'public') => {
    const url = `/dancecard/${slug}?previewRole=${role}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!searchParams.get('tab')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'dashboard')
      const qs = params.toString()
      const href = `/organizer/dancecard/${slug}?${qs}`
      router.replace(href, { scroll: false })
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', href)
      }
    }
  }, [router, searchParams, slug])

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'media') {
      switchTab('exports')
    }
  }, [searchParams, switchTab])

  const wideLayoutForTab = tab === 'program' || tab === 'people' || tab === 'registrants'
  const rawPeopleSubTab = searchParams.get(PEOPLE_SUB_TAB_PARAM)
  const publishFilterDraft = searchParams.get('publishFilter') === 'draft'

  const commandContext = useMemo(
    () => ({
      eventSlug: slug,
      switchTab: (t: OrganizerTab) => switchTab(t),
      openConflicts: () => {
        switchTab('program')
        setConflictsPulse(true)
        window.setTimeout(() => setConflictsPulse(false), 900)
      },
      openDraftProgram: () => switchTab('program', { publishFilter: 'draft' }),
      openSetupTask: (taskId: string) => {
        const task = SETUP_TASKS.find((t) => t.id === taskId)
        if (!task) return
        switchTab(task.href.tab, {
          settingsPanel: task.href.settingsPanel ?? null,
          peopleTab: task.href.peopleTab ?? null,
          publishFilter: task.href.publishFilter ?? null,
        })
      },
      previewRole,
    }),
    [slug, switchTab],
  )

  return (
    <OrganizerCommandProvider value={commandContext}>
      <OrganizerCommandShell eventSlug={slug}>
        <GuideRouter
          eventSlug={slug}
          onSwitchTab={(t) => {
            switchTab(t, { slotId: null })
          }}
        />

        <OrganizerEventShell
          eventSlug={slug}
          eventTitle={bootstrapReady ? eventTitle || slug : 'Loading event…'}
          activeTab={tab}
          readOnly={readOnly}
          wideCanvas={wideCanvas}
          onSelectTab={(t) => switchTab(t, { slotId: t === 'program' ? initialSlotId : null })}
          onToggleWideCanvas={toggleWideCanvas}
          onPreviewRole={previewRole}
          wideLayoutForTab={wideLayoutForTab}
        >
          <C2kFromBanner />

          {tab === 'program' ? <GhostCursorRehearsal eventSlug={slug} /> : null}
          {loadErr ? (
            <p className="mb-4 text-sm text-dc-danger">{loadErr}</p>
          ) : null}
          {!bootstrapReady && !loadErr ? <OrganizerWorkspaceSkeleton /> : null}
          {bootstrapReady ? (
          <TabContentTransition tabKey={tab}>
          {notice && tab !== 'dashboard' ? (
            <div className="mb-4 rounded-xl border border-dc-warning/25 bg-dc-warning-muted px-4 py-3 text-sm text-dc-warning">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p>{notice}</p>
                <button
                  type="button"
                  className="self-start rounded-lg border border-dc-warning/30 px-3 py-1 text-xs font-medium sm:self-auto"
                  onClick={() => setNotice(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'dashboard' ? (
            <OrganizerEventDashboard
              eventSlug={slug}
              eventTitle={eventTitle}
              event={bootstrapEvent}
              slots={slots}
              readOnly={readOnly}
              onNavigateTab={(t, opts) =>
                switchTab(t, {
                  peopleTab: opts?.peopleTab ?? null,
                  settingsPanel: opts?.settingsPanel ?? null,
                  publishFilter: opts?.publishFilter ?? null,
                })
              }
            />
          ) : null}
          {tab === 'people' ? (
            <PeopleHubPanel
              eventSlug={slug}
              readOnly={readOnly}
              organizerRole={organizerRole}
              timezone={timezone}
              windowStartsAt={windowStartsAt}
              windowEndsAt={windowEndsAt}
              shifts={shifts}
              onRefreshStaff={refreshStaff}
              hasEventWindow={hasEventWindow}
            />
          ) : null}
          {tab === 'settings' ? <EventSettingsPanel eventSlug={slug} organizerRole={organizerRole} /> : null}
          {tab === 'venues' ? (
            hasEventWindow ? (
              <VenueAvailabilityGrid
                eventSlug={slug}
                timezone={timezone}
                slots={slots}
                shifts={shifts}
                onRefresh={refreshProgram}
                onSlotUpdated={mergeProgramSlot}
                readOnly={readOnly}
                onGoVenueSettings={goVenueSettings}
              />
            ) : (
              <EventSetupRequired onGoSettings={() => switchTab('settings')} />
            )
          ) : null}
          {tab === 'assignments' ? (
            <AssignmentBoardPanel
              eventSlug={slug}
              timezone={timezone}
              slots={slots}
              onRefresh={refreshProgram}
              readOnly={readOnly}
              onNavigateTab={switchTab}
            />
          ) : null}
          {tab === 'program' ? (
            <ProgramTab
              eventSlug={slug}
              eventProfile={bootstrapEvent?.eventProfile}
              timezone={timezone}
              windowStartsAt={windowStartsAt}
              windowEndsAt={windowEndsAt}
              slots={slots}
              onRefresh={refreshProgram}
              readOnly={readOnly}
              initialSlotId={initialSlotId}
              onSlotLinkChange={(slotId) => switchTab('program', { slotId })}
              hasEventWindow={hasEventWindow}
              onGoSettings={() => switchTab('settings')}
              onConflictsScanned={() => {
                setConflictsPulse(true)
                window.setTimeout(() => setConflictsPulse(false), 900)
              }}
              conflictSonarActive={conflictsPulse}
              publishFilterDraft={publishFilterDraft}
              onOpenScheduleCredits={() => switchTab('assignments')}
              onLaunchConflictGuide={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('guide', 'conflicts')
                const qs = params.toString()
                router.replace(`/organizer/dancecard/${slug}?${qs}`, { scroll: false })
              }}
              wideCanvas={wideCanvas}
            />
          ) : null}
          {tab === 'exports' ? <ExportsHubPanel eventSlug={slug} /> : null}
          {tab === 'messaging' ? <MessagingPanel eventSlug={slug} readOnly={readOnly} /> : null}
          {tab === 'import' ? (
            hasEventWindow ? (
              <ScheduleImportPanel
                eventSlug={slug}
                timezone={timezone}
                windowStartsAt={windowStartsAt}
                windowEndsAt={windowEndsAt}
                readOnly={readOnly}
                organizerRole={organizerRole}
              />
            ) : (
              <EventSetupRequired onGoSettings={() => switchTab('settings')} />
            )
          ) : null}
          {tab === 'integrations' ? <IntegrationsPanel eventSlug={slug} organizerRole={organizerRole} /> : null}
          </TabContentTransition>
          ) : null}
        </OrganizerEventShell>
      </OrganizerCommandShell>
    </OrganizerCommandProvider>
  )
}
