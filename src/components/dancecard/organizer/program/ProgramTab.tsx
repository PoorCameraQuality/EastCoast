'use client'

import { useEffect, useState } from 'react'
import { useGuideState } from '@/lib/dancecard/guides/useGuideState'
import { ProgramScheduleGrid } from '@/components/dancecard/organizer/ProgramScheduleGrid'
import { ConflictDock } from '@/components/dancecard/organizer/program/ConflictDock'
import { useProgramConflicts } from '@/components/dancecard/organizer/program/useProgramConflicts'
import { ProgramListView } from '@/components/dancecard/organizer/program/ProgramListView'
import { useEventProfileLabels } from '@/hooks/useEventProfileLabels'
import { EventSetupRequired } from '@/components/dancecard/organizer/EventSetupRequired'
import type { ProgramSlotRow } from '@/lib/dancecard/organizerProgramSlotDto'

type Props = {
  eventSlug: string
  eventProfile?: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  slots: ProgramSlotRow[]
  onRefresh: () => Promise<void>
  readOnly: boolean
  initialSlotId: string | null
  onSlotLinkChange: (slotId: string | null) => void
  hasEventWindow: boolean
  onGoSettings: () => void
  onConflictsScanned?: () => void
  conflictSonarActive?: boolean
  onOpenScheduleCredits?: () => void
  onLaunchConflictGuide?: () => void
  publishFilterDraft?: boolean
  wideCanvas?: boolean
}

export function ProgramTab({
  eventSlug,
  eventProfile,
  timezone,
  windowStartsAt,
  windowEndsAt,
  slots,
  onRefresh,
  readOnly,
  initialSlotId,
  onSlotLinkChange,
  hasEventWindow,
  onGoSettings,
  onConflictsScanned,
  conflictSonarActive,
  onOpenScheduleCredits,
  onLaunchConflictGuide,
  publishFilterDraft,
  wideCanvas,
}: Props) {
  const { conflicts, loading, loadError, refresh } = useProgramConflicts(eventSlug)
  const { labels: profileLabels } = useEventProfileLabels({ eventSlug, source: 'organizer', eventProfile })
  const { reset: startProgramTour } = useGuideState(eventSlug, 'program-rehearsal')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [drawerTab, setDrawerTab] = useState<'overview' | 'edit' | 'privacy' | undefined>()
  const [focusSlotId, setFocusSlotId] = useState<string | null>(initialSlotId)

  useEffect(() => {
    if (!initialSlotId) {
      setFocusSlotId(null)
      return
    }
    if (slots.some((s) => s.id === initialSlotId)) setFocusSlotId(initialSlotId)
  }, [initialSlotId, slots])

  if (!hasEventWindow) {
    return <EventSetupRequired onGoSettings={onGoSettings} />
  }

  function openSlot(id: string, opts?: { editTab?: 'edit' | 'privacy' }) {
    setFocusSlotId(id)
    onSlotLinkChange(id)
    if (opts?.editTab) setDrawerTab(opts.editTab)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={
            view === 'grid'
              ? 'rounded-lg bg-dc-accent/20 px-3 py-1 text-sm text-dc-accent'
              : 'rounded-lg border border-dc-border px-3 py-1 text-sm text-dc-muted'
          }
          onClick={() => setView('grid')}
        >
          Grid
        </button>
        <button
          type="button"
          className={
            view === 'list'
              ? 'rounded-lg bg-dc-accent/20 px-3 py-1 text-sm text-dc-accent'
              : 'rounded-lg border border-dc-border px-3 py-1 text-sm text-dc-muted'
          }
          onClick={() => setView('list')}
        >
          List
        </button>
        <button
          type="button"
          className="ml-auto rounded-lg border border-dc-border px-3 py-1 text-sm text-dc-muted hover:bg-dc-elevated-muted/80 hover:text-dc-text"
          onClick={() => startProgramTour()}
        >
          Grid tour
        </button>
      </div>
      {view === 'grid' ? (
        <p className="rounded-lg border border-dc-border-subtle bg-dc-surface-muted/50 px-3 py-2 text-xs text-dc-muted">
          Click the gold <span className="font-semibold text-dc-accent">Edit</span> button on any block, or{' '}
          <span className="font-medium text-dc-text">double-click</span> the block, to assign people and change details.
          Drag the <span className="font-medium text-dc-text">title</span> to move times.
        </p>
      ) : null}
      {publishFilterDraft ? (
        <p className="rounded-lg border border-dc-warning/30 bg-dc-warning-muted px-3 py-2 text-sm text-dc-warning">
          Showing draft (unpublished) activities only. Publish from the activity drawer when ready.
        </p>
      ) : null}
      {loadError ? (
        <p className="rounded-lg border border-dc-danger/30 bg-dc-danger-muted px-3 py-2 text-sm text-dc-danger">
          {loadError}
        </p>
      ) : null}
      <ConflictDock
        conflicts={loading || loadError ? [] : conflicts}
        slots={slots}
        onOpenSlot={(slotId, opts) => openSlot(slotId, opts)}
        onOpenBoth={(a) => openSlot(a)}
        onOpenScheduleCredits={onOpenScheduleCredits}
        onLaunchConflictGuide={onLaunchConflictGuide}
      />
      {view === 'list' ? (
        <ProgramListView eventSlug={eventSlug} timezone={timezone} slots={slots} onOpenSlot={(id) => openSlot(id)} />
      ) : (
      <ProgramScheduleGrid
        eventSlug={eventSlug}
        timezone={timezone}
        windowStartsAt={windowStartsAt}
        windowEndsAt={windowEndsAt}
        slots={slots}
        onRefresh={onRefresh}
        readOnly={readOnly}
        initialSlotId={focusSlotId}
        drawerInitialTab={drawerTab}
        onDrawerTabConsumed={() => setDrawerTab(undefined)}
        onSlotLinkChange={(id) => openSlot(id)}
        conflictSlotIds={conflicts.flatMap((c) => c.relatedSlotIds)}
        conflictSonarActive={conflictSonarActive}
        onConflictsRefresh={async () => {
          await refresh()
          onConflictsScanned?.()
        }}
        wideCanvas={wideCanvas}
        gridLabels={{
          scheduledItem: profileLabels.scheduledItem,
          scheduledItemPlural: profileLabels.scheduledItemPlural,
          addItemCta: profileLabels.addItemCta,
        }}
      />
      )}
    </div>
  )
}
