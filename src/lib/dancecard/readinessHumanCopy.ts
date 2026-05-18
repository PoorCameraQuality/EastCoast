import type { ReadinessCheck } from '@/lib/dancecard/readinessTypes'
import type { PeopleSubTab } from '@/components/dancecard/organizer/shell/organizerNavConfig'

export function formatEventWindow(startsAt: string, endsAt: string, timezone: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 'this time block'
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
  const fmt = new Intl.DateTimeFormat('en-US', opts)
  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) {
    const datePart = fmt.format(start)
    const timeFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
    })
    return `${datePart}, ${timeFmt.format(start)} – ${timeFmt.format(end)}`
  }
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

export function readinessAction(
  tab: NonNullable<ReadinessCheck['action']>['tab'],
  label: string,
  opts?: { peopleTab?: PeopleSubTab; settingsPanel?: string },
): ReadinessCheck['action'] {
  return { tab, label, ...opts }
}

export const READINESS_ACTION = {
  program: readinessAction('program', 'Open program'),
  assignments: readinessAction('assignments', 'Add presenters'),
  venues: readinessAction('venues', 'Review rooms'),
  peopleCoverage: readinessAction('people', 'Coverage roles', { peopleTab: 'coverage' }),
  settings: readinessAction('settings', 'Event settings'),
  peopleStaff: readinessAction('people', 'Staff shifts', { peopleTab: 'staff' }),
  import: readinessAction('import', 'Open import'),
} as const

/** Map conflict scanner output to organizer-friendly readiness rows. */
export function conflictToReadinessCheck(c: {
  id: string
  severity: 'info' | 'warning'
  title: string
  detail?: string
}): ReadinessCheck {
  const lower = c.title.toLowerCase()
  if (lower.includes('double-book')) {
    return {
      id: c.id.slice(0, 120),
      severity: c.severity,
      title: 'Two activities share the same room at the same time',
      detail: c.detail
        ? 'Fix the overlap on the room grid or move one activity to another room.'
        : 'Open the room grid to see which activities collide.',
      action: READINESS_ACTION.venues,
    }
  }
  if (lower.includes('presenter') || lower.includes('moderator')) {
    return {
      id: c.id.slice(0, 120),
      severity: c.severity,
      title: 'Someone is scheduled in two activities at once',
      detail: 'A presenter or moderator is double-booked. Adjust assignments or activity times.',
      action: READINESS_ACTION.assignments,
    }
  }
  if (lower.includes('photographer overlap')) {
    return {
      id: c.id.slice(0, 120),
      severity: c.severity,
      title: 'A photographer is scheduled in two activities at once',
      detail: 'Move or shorten one assignment so coverage does not overlap.',
      action: READINESS_ACTION.assignments,
    }
  }
  if (lower.includes('no-photo') || lower.includes('photo-restricted') || lower.includes('photography')) {
    return {
      id: c.id.slice(0, 120),
      severity: c.severity,
      title: c.severity === 'warning' ? 'Photographers listed on a no-photo activity' : 'Check photo rules for this activity',
      detail: c.detail ?? 'The activity photo setting does not match who is assigned.',
      action: READINESS_ACTION.program,
    }
  }
  if (lower.includes('coverage gap') || lower.includes('dm')) {
    return {
      id: c.id.slice(0, 120),
      severity: c.severity,
      title: c.title.includes('gap') ? 'Not enough dungeon monitors on duty' : c.title,
      detail: c.detail,
      action: READINESS_ACTION.peopleCoverage,
    }
  }
  return {
    id: c.id.slice(0, 120),
    severity: c.severity,
    title: c.title,
    detail: c.detail,
    action: READINESS_ACTION.program,
  }
}
