import { formatTime } from '@/components/dancecard/time'

export type OpenWindowSuggestion = {
  id: string
  day: string
  time: string
  duration: string
  startMs: number
  endMs: number
}

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

/** Longest open gaps (≥1h) for quick-pick chips in compare / share flows. */
export function bestOpenWindows(
  intervals: { start: string; end: string }[],
  tz: string,
  max = 4
): OpenWindowSuggestion[] {
  return intervals
    .map((interval, index) => {
      const startMs = Date.parse(interval.start)
      const endMs = Date.parse(interval.end)
      const durationMs = endMs - startMs
      return {
        id: `${interval.start}-${index}`,
        day: new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: tz,
        }).format(new Date(interval.start)),
        time: `${formatTime(interval.start, tz)} – ${formatTime(interval.end, tz)}`,
        duration: formatDuration(durationMs),
        startMs,
        endMs,
        durationMs,
      }
    })
    .filter((item) => Number.isFinite(item.startMs) && Number.isFinite(item.endMs) && item.durationMs >= 60 * 60_000)
    .sort((a, b) => b.durationMs - a.durationMs || a.startMs - b.startMs)
    .slice(0, max)
    .map(({ durationMs: _durationMs, ...item }) => item)
}
