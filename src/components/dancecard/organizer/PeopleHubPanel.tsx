'use client'

import { PeopleDirectoryPanel } from '@/components/dancecard/organizer/PeopleDirectoryPanel'
import { RegistrantsPanel } from '@/components/dancecard/organizer/RegistrantsPanel'
import { StaffShiftsPanel } from '@/components/dancecard/organizer/StaffShiftsPanel'
import { ShiftSwapsPanel } from '@/components/dancecard/organizer/ShiftSwapsPanel'
import { VettingQueuePanel } from '@/components/dancecard/organizer/VettingQueuePanel'
import { BadgesPrintPanel } from '@/components/dancecard/organizer/BadgesPrintPanel'
import { DmCoveragePanel } from '@/components/dancecard/organizer/DmCoveragePanel'
import { usePeopleSubTab } from '@/components/dancecard/organizer/usePeopleSubTab'
import type { OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import { copy } from '@/lib/dancecard/productCopy'
import { cn } from '@/lib/cn'

const TAB_LABELS: Record<string, string> = {
  signups: copy.signups,
  roster: 'Staff roster (overview)',
  staff: 'Staff shifts',
  applications: 'Special roles & applications',
  swaps: 'Shift swaps',
  badges: 'Badges',
  coverage: 'Coverage & assignments',
}

type Props = {
  eventSlug: string
  readOnly: boolean
  organizerRole: OrganizerRoleForClient | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  shifts: OrganizerStaffShiftDto[]
  onRefreshStaff: () => Promise<void>
  hasEventWindow: boolean
}

export function PeopleHubPanel({
  eventSlug,
  readOnly,
  organizerRole,
  timezone,
  windowStartsAt,
  windowEndsAt,
  shifts,
  onRefreshStaff,
  hasEventWindow,
}: Props) {
  const { peopleTab, setPeopleTab, allTabs } = usePeopleSubTab(eventSlug, 'signups')

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-dc-muted">
        {copy.signups} are ticket records. {copy.roster} is everyone on your schedule or in ops. The same person may appear
        in both lists.
      </p>

      <nav
        className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="People sections"
      >
        {allTabs.map((t) => (
          <button
            key={t}
            type="button"
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              peopleTab === t
                ? 'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
                : 'border-dc-border text-dc-muted hover:border-dc-accent-border/50 hover:text-dc-text',
            )}
            onClick={() => setPeopleTab(t)}
          >
            {TAB_LABELS[t] ?? t}
          </button>
        ))}
      </nav>

      {peopleTab === 'signups' ? (
        <RegistrantsPanel eventSlug={eventSlug} readOnly={readOnly} organizerRole={organizerRole} />
      ) : null}
      {peopleTab === 'roster' ? (
        <PeopleDirectoryPanel eventSlug={eventSlug} readOnly={readOnly} organizerRole={organizerRole} />
      ) : null}
      {peopleTab === 'staff' ? (
        <StaffShiftsPanel
          eventSlug={eventSlug}
          timezone={timezone}
          shifts={shifts}
          onRefresh={onRefreshStaff}
          readOnly={readOnly}
        />
      ) : null}
      {peopleTab === 'applications' ? <VettingQueuePanel eventSlug={eventSlug} organizerRole={organizerRole} /> : null}
      {peopleTab === 'swaps' ? <ShiftSwapsPanel eventSlug={eventSlug} timezone={timezone} readOnly={readOnly} /> : null}
      {peopleTab === 'badges' ? <BadgesPrintPanel eventSlug={eventSlug} readOnly={readOnly} /> : null}
      {peopleTab === 'coverage' ? (
        hasEventWindow ? (
          <DmCoveragePanel
            eventSlug={eventSlug}
            timezone={timezone}
            windowStartsAt={windowStartsAt}
            windowEndsAt={windowEndsAt}
            shifts={shifts}
            onRefreshShifts={onRefreshStaff}
            readOnly={readOnly}
          />
        ) : (
          <p className="text-sm text-dc-muted">Set event dates in Settings before configuring coverage roles.</p>
        )
      ) : null}
    </div>
  )
}
