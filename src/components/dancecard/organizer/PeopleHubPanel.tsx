'use client'

import { PeopleDirectoryPanel } from '@/components/dancecard/organizer/PeopleDirectoryPanel'
import { RegistrantsPanel } from '@/components/dancecard/organizer/RegistrantsPanel'
import { StaffShiftsPanel } from '@/components/dancecard/organizer/StaffShiftsPanel'
import { ShiftSwapsPanel } from '@/components/dancecard/organizer/ShiftSwapsPanel'
import { VettingQueuePanel } from '@/components/dancecard/organizer/VettingQueuePanel'
import { BadgesPrintPanel } from '@/components/dancecard/organizer/BadgesPrintPanel'
import { DmCoveragePanel } from '@/components/dancecard/organizer/DmCoveragePanel'
import { SafetyIncidentsPanel } from '@/components/dancecard/organizer/SafetyIncidentsPanel'
import { VolunteerCompliancePanel } from '@/components/dancecard/organizer/VolunteerCompliancePanel'
import { usePeopleSubTab } from '@/components/dancecard/organizer/usePeopleSubTab'
import type { PeopleSubTab } from '@/components/dancecard/organizer/shell/organizerNavConfig'
import type { OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import { OrganizerSectionTabs } from '@/components/dancecard/organizer/ui/OrganizerSectionTabs'
import { copy } from '@/lib/dancecard/productCopy'

const TAB_LABELS: Record<string, string> = {
  signups: copy.signups,
  roster: 'Staff roster (overview)',
  staff: 'Staff shifts',
  applications: 'Special roles & applications',
  swaps: 'Shift swaps',
  badges: 'Badges',
  coverage: 'Coverage & assignments',
  incidents: 'Safety incidents',
  compliance: 'Volunteer compliance',
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

  const sectionTabs = allTabs.map((t) => ({ id: t, label: TAB_LABELS[t] ?? t }))

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm leading-relaxed text-dc-muted">
        {copy.signups} are ticket records. {copy.roster} is everyone on your schedule or in ops. The same person may appear
        in both lists.
      </p>

      <OrganizerSectionTabs
        tabs={sectionTabs}
        activeId={peopleTab}
        onChange={(id) => setPeopleTab(id as PeopleSubTab)}
        heading="People — switch section"
        ariaLabel="People hub sections"
      />

      <div
        id={`organizer-section-${peopleTab}`}
        role="tabpanel"
        aria-labelledby={`organizer-section-tab-${peopleTab}`}
        className="min-w-0"
      >
      {peopleTab === 'signups' ? (
        <RegistrantsPanel eventSlug={eventSlug} readOnly={readOnly} organizerRole={organizerRole} />
      ) : null}
      {peopleTab === 'roster' ? (
        <PeopleDirectoryPanel
          eventSlug={eventSlug}
          timezone={timezone}
          readOnly={readOnly}
          organizerRole={organizerRole}
        />
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
      {peopleTab === 'incidents' ? (
        <SafetyIncidentsPanel eventSlug={eventSlug} organizerRole={organizerRole ?? 'viewer'} readOnly={readOnly} />
      ) : null}
      {peopleTab === 'compliance' ? <VolunteerCompliancePanel eventSlug={eventSlug} /> : null}
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
    </div>
  )
}
