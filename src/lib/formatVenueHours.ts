/** Converts schema.org openingHours (e.g. "Fr 20:00-02:00, Sa 20:00-02:00") to human-readable format. */
export function formatVenueHours(hours: string): string {
  const dayMap: Record<string, string> = {
    Mo: 'Monday',
    Tu: 'Tuesday',
    We: 'Wednesday',
    Th: 'Thursday',
    Fr: 'Friday',
    Sa: 'Saturday',
    Su: 'Sunday',
  }
  const parts = hours.split(',').map((s) => s.trim())
  return parts
    .map((part) => {
      const match = part.match(/^([A-Za-z]{2})\s+(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
      if (!match) return part
      const [, day, startH, startM, endH, endM] = match
      const dayName = dayMap[day as keyof typeof dayMap] || day
      const fmt = (h: string, m: string) => {
        const hour = parseInt(h, 10)
        const mins = `:${m}`
        if (hour === 0) return `12${mins} am`
        if (hour === 12) return `12${mins} pm`
        return hour > 12 ? `${hour - 12}${mins} pm` : `${hour}${mins} am`
      }
      return `${dayName} ${fmt(startH, startM)} – ${fmt(endH, endM)}`
    })
    .join('\n')
}
