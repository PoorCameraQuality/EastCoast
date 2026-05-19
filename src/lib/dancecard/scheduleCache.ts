/** Client-side schedule snapshot for offline-ish program viewing. */

const PREFIX = 'eck_dc_schedule_v1_'

export type ScheduleSnapshot<T> = {
  fetchedAt: string
  data: T
}

export function readScheduleSnapshot<T>(eventSlug: string): ScheduleSnapshot<T> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${eventSlug}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ScheduleSnapshot<T>
    if (!parsed?.fetchedAt || parsed.data === undefined) return null
    return parsed
  } catch {
    return null
  }
}

export function writeScheduleSnapshot<T>(eventSlug: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    const snap: ScheduleSnapshot<T> = { fetchedAt: new Date().toISOString(), data }
    window.localStorage.setItem(`${PREFIX}${eventSlug}`, JSON.stringify(snap))
  } catch {
    /* quota */
  }
}

const MAP_PREFIX = 'eck_dc_venue_map_v1_'

export function readVenueMapSnapshot<T>(eventSlug: string): ScheduleSnapshot<T> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${MAP_PREFIX}${eventSlug}`)
    if (!raw) return null
    return JSON.parse(raw) as ScheduleSnapshot<T>
  } catch {
    return null
  }
}

export function writeVenueMapSnapshot<T>(eventSlug: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      `${MAP_PREFIX}${eventSlug}`,
      JSON.stringify({ fetchedAt: new Date().toISOString(), data })
    )
  } catch {
    /* ignore */
  }
}

const QUEUE_PREFIX = 'eck_dc_dancecard_queue_v1_'

export type QueuedDancecardPut = {
  id: string
  body: unknown
  queuedAt: string
}

export function readDancecardPutQueue(eventSlug: string): QueuedDancecardPut[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(`${QUEUE_PREFIX}${eventSlug}`)
    if (!raw) return []
    return JSON.parse(raw) as QueuedDancecardPut[]
  } catch {
    return []
  }
}

export function enqueueDancecardPut(eventSlug: string, body: unknown): void {
  if (typeof window === 'undefined') return
  const q = readDancecardPutQueue(eventSlug)
  q.push({ id: crypto.randomUUID(), body, queuedAt: new Date().toISOString() })
  try {
    window.localStorage.setItem(`${QUEUE_PREFIX}${eventSlug}`, JSON.stringify(q))
  } catch {
    /* ignore */
  }
}

export function clearDancecardPutQueue(eventSlug: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(`${QUEUE_PREFIX}${eventSlug}`)
  } catch {
    /* ignore */
  }
}
