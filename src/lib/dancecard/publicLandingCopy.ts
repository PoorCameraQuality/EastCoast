/** Friendly copy for public dancecard landing (strips dev/seed jargon when present). */

export function humanizeProductTitle(title: string): string {
  const t = title.trim()
  if (/east coast kink events/i.test(t) && /dancecard/i.test(t)) return 'Dancecard'
  return t || 'Dancecard'
}

export function humanizeEventTitle(title: string): string {
  return title.replace(/\s*\(full demo\)\s*/i, '').trim() || title
}

export function humanizeLandingSubtitle(subtitle: string): string {
  const t = subtitle.trim()
  if (!t) return subtitle
  if (/synthetic demo|product testing|top-to-bottom/i.test(t)) {
    return 'A full sample weekend—browse the program, sign in, and try your dancecard.'
  }
  return t
}

export function humanizeSharedByDetail(detail: string | null | undefined): string | null {
  const t = detail?.trim()
  if (!t) return null
  if (/seeded by|npm run|synthetic|demo data/i.test(t)) return null
  return t
}

export function scheduleCountLabel(count: number): string {
  if (count === 0) return ''
  return count === 1 ? '1 activity on the schedule' : `${count} activities on the schedule`
}
