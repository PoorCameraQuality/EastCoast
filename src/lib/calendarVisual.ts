import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'

export type CalendarPillTone = {
  bar: string
  pill: string
  label: string
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function startOfToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

export function isPastItem(item: PublicEventIndexItem): boolean {
  return parseLocalDate(item.endsAt) < startOfToday()
}

export function isTodayDate(date: Date): boolean {
  const t = startOfToday()
  return date.getTime() === t.getTime()
}

export function eventOnDate(item: PublicEventIndexItem, date: Date): boolean {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const start = parseLocalDate(item.startsAt)
  const end = parseLocalDate(item.endsAt)
  return d >= start && d <= end
}

export type SpanRole = 'single' | 'start' | 'middle' | 'end'

export function spanRoleForDate(item: PublicEventIndexItem, date: Date): SpanRole | null {
  if (!eventOnDate(item, date)) return null
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const start = parseLocalDate(item.startsAt)
  const end = parseLocalDate(item.endsAt)
  if (start.getTime() === end.getTime()) return 'single'
  if (d.getTime() === start.getTime()) return 'start'
  if (d.getTime() === end.getTime()) return 'end'
  return 'middle'
}

export function calendarPillTone(item: PublicEventIndexItem, past: boolean): CalendarPillTone {
  if (past) {
    return { bar: 'cal-tone-past', pill: 'cal-badge-past', label: 'Past' }
  }
  if (item.listingKind === 'convention' || item.eventType === 'hotel_weekend') {
    return { bar: 'cal-tone-convention', pill: 'cal-badge-convention', label: 'Convention' }
  }
  if (item.eventType === 'campout' || /outdoor/i.test(item.category)) {
    return { bar: 'cal-tone-outdoor', pill: 'cal-badge-outdoor', label: 'Outdoor' }
  }
  if (item.eventType === 'class') {
    return { bar: 'cal-tone-class', pill: 'cal-badge-class', label: 'Class' }
  }
  if (item.eventType === 'party') {
    return { bar: 'cal-tone-party', pill: 'cal-badge-party', label: 'Party' }
  }
  if (item.eventType === 'vendor_market') {
    return { bar: 'cal-tone-vendor', pill: 'cal-badge-vendor', label: 'Vendor market' }
  }
  return { bar: 'cal-tone-default', pill: 'cal-badge-default', label: item.category }
}

export function typeBadgeLabel(item: PublicEventIndexItem): string {
  return calendarPillTone(item, false).label
}

export function groupByWeek(
  items: PublicEventIndexItem[]
): { label: string; items: PublicEventIndexItem[] }[] {
  const sorted = [...items].sort(
    (a, b) => parseLocalDate(a.startsAt).getTime() - parseLocalDate(b.startsAt).getTime()
  )
  const groups = new Map<string, { label: string; items: PublicEventIndexItem[] }>()

  for (const item of sorted) {
    const start = parseLocalDate(item.startsAt)
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() - start.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const key = weekStart.toISOString().slice(0, 10)
    if (!groups.has(key)) {
      groups.set(key, {
        label: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        items: [],
      })
    }
    groups.get(key)!.items.push(item)
  }

  return Array.from(groups.values())
}

/** Unique states sorted by event count desc */
export function activeStates(items: PublicEventIndexItem[]): string[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    if (!item.state) continue
    counts.set(item.state, (counts.get(item.state) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s)
}
