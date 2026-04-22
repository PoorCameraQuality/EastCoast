/** Value for `<input type="datetime-local" />` in the browser's local timezone. */
export function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatRange(isoStart: string, isoEnd: string, tz: string): string {
  const s = new Date(isoStart)
  const e = new Date(isoEnd)
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const t1 = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${dtf.format(s)} · ${t1.format(e)}`
}

export function dayLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function groupSlotsByDay<T extends { startsAt: string }>(
  slots: T[],
  tz: string
): { day: string; items: T[] }[] {
  const map = new Map<string, T[]>()
  for (const s of slots) {
    const key = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(s.startsAt))
    const arr = map.get(key) ?? []
    arr.push(s)
    map.set(key, arr)
  }
  const keys = Array.from(map.keys()).sort()
  return keys.map((k) => {
    const items = (map.get(k) ?? []).sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    )
    const label = items[0] ? dayLabel(items[0].startsAt, tz) : k
    return { day: label, items }
  })
}

export function discordLine(args: { displayName: string; eventTitle: string; url: string }): string {
  return `I'm **${args.displayName}** — East Coast Kink Events dancecard for **${args.eventTitle}**: ${args.url}`
}
