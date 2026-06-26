import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import { parseLocalDate } from '@/lib/calendarVisual'

function formatIcal(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function eventIcalBlock(item: PublicEventIndexItem): string[] {
  const start = parseLocalDate(item.startsAt)
  const end = parseLocalDate(item.endsAt)
  end.setDate(end.getDate() + 1)
  return [
    'BEGIN:VEVENT',
    `UID:${item.slug}@eastcoastkinkevents.com`,
    `DTSTART:${formatIcal(start)}`,
    `DTEND:${formatIcal(end)}`,
    `SUMMARY:${item.title}`,
    `DESCRIPTION:${item.title} - ${item.dateDisplay}\\nLocation: ${item.city}, ${item.state}\\n\\nhttps://www.eastcoastkinkevents.com/events/${item.slug}`,
    `LOCATION:${item.city}, ${item.state}`,
    `URL:https://www.eastcoastkinkevents.com/events/${item.slug}`,
    'END:VEVENT',
  ]
}

export function downloadIcal(filename: string, blocks: string[]) {
  const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//East Coast Kink Events//Calendar//EN', ...blocks, 'END:VCALENDAR'].join('\r\n')
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportEventsToGoogle(items: PublicEventIndexItem[], title: string) {
  if (items.length === 0) return
  if (items.length === 1) {
    const item = items[0]!
    const start = parseLocalDate(item.startsAt)
    const end = parseLocalDate(item.endsAt)
    end.setHours(23, 59, 59)
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${formatIcal(start)}/${formatIcal(end)}&details=${encodeURIComponent(`${item.title}\n${item.city}, ${item.state}\nhttps://www.eastcoastkinkevents.com/events/${item.slug}`)}&location=${encodeURIComponent(`${item.city}, ${item.state}`)}`
    window.open(url, '_blank')
    return
  }
  const list = items.map((e) => `${e.title} — ${e.dateDisplay} (${e.city}, ${e.state})`).join('\n')
  const start = parseLocalDate(items[0]!.startsAt)
  const end = parseLocalDate(items[items.length - 1]!.endsAt)
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatIcal(start)}/${formatIcal(end)}&details=${encodeURIComponent(`${list}\n\nhttps://www.eastcoastkinkevents.com/calendar`)}`
  window.open(url, '_blank')
}

export function exportEventsToIcal(items: PublicEventIndexItem[], filename: string) {
  if (items.length === 0) return
  downloadIcal(filename, items.flatMap(eventIcalBlock))
}

export function exportEventsToApple(items: PublicEventIndexItem[], filename: string) {
  exportEventsToIcal(items, filename)
}

export function exportSingleEvent(item: PublicEventIndexItem, target: 'google' | 'apple' | 'ical') {
  if (target === 'google') exportEventsToGoogle([item], item.title)
  else exportEventsToIcal([item], `${item.slug}.ics`)
}
