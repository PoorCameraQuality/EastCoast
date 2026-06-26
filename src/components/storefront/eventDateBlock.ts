export type EventDateBlockParts = {
  month: string
  startDay: number
  endDay: number
  showEndDay: boolean
}

export function parseEventDateBlock(start: string, end: string): EventDateBlockParts {
  const s = new Date(start)
  const e = new Date(end)
  const month = s.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const startDay = s.getDate()
  const endDay = e.getDate()
  const showEndDay = startDay !== endDay || s.getMonth() !== e.getMonth()
  return { month, startDay, endDay, showEndDay }
}

export function formatEventDatePill(start: string, end: string, display: string): string {
  const { month, startDay, endDay, showEndDay } = parseEventDateBlock(start, end)
  if (showEndDay) {
    return `${month} ${startDay}–${endDay}`
  }
  return display.length <= 18 ? display : `${month} ${startDay}`
}

export function categoryBadges(category: string, tagSlugs?: string[]): string[] {
  const badges: string[] = []
  const cat = category.toLowerCase()
  if (/convention|conference|weekend/i.test(cat)) badges.push('Convention')
  else if (/workshop|class|education/i.test(cat)) badges.push('Education')
  else if (/party|social|munch/i.test(cat)) badges.push('Weekend')
  else if (/outdoor/i.test(cat)) badges.push('Outdoor')
  else badges.push(category.split(/[·,]/)[0]?.trim() || 'Event')

  if (tagSlugs?.includes('rope')) badges.push('Rope')
  if (tagSlugs?.includes('beginner-friendly') && !badges.includes('Education')) {
    badges.push('New friendly')
  }

  return Array.from(new Set(badges)).slice(0, 3)
}
