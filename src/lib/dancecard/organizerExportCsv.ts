/** Shared CSV helpers for organizer export routes (Phase 5 P5.3). */

export function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
