import { publicEventLifecycle, type ManagedEventRow } from '@/lib/eckeOrgEventShared'

export const DASHBOARD_EVENT_LIMIT = 8

export function formatDashboardDate(value: string) {
  if (!value) return 'Date TBA'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function eventLocationLabel(event: Pick<ManagedEventRow, 'is_online' | 'city' | 'state'>) {
  if (event.is_online) return 'Online'
  const city = event.city?.trim()
  const state = event.state?.trim()
  if (city && state) return `${city}, ${state}`
  return city || state || 'Location TBA'
}

function eventGroup(event: ManagedEventRow) {
  const life = publicEventLifecycle(event)
  if (life === 'draft') return 0
  if (life === 'published') return 1
  if (life === 'past') return 2
  return 3
}

export function sortDashboardEvents(events: ManagedEventRow[]) {
  return [...events].sort((a, b) => {
    const group = eventGroup(a) - eventGroup(b)
    if (group !== 0) return group
    return a.start_date.localeCompare(b.start_date)
  })
}

export function dashboardEventStatus(event: ManagedEventRow) {
  return publicEventLifecycle(event)
}
