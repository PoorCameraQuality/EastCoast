type CountStats = {
  events: number
  conventions: number
  places: number
}

export function hubCountLabel(stats: CountStats): string {
  const events = stats.events + stats.conventions
  const parts: string[] = []
  if (events > 0) parts.push(`${events} upcoming`)
  if (stats.places > 0) parts.push(`${stats.places} places`)
  if (parts.length === 0) return 'Growing hub'
  return parts.join(', ')
}
