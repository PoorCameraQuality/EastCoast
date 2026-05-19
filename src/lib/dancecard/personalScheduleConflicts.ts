export type PersonalConflictWarning = {
  slotIdA: string
  slotIdB: string
  titleA: string
  titleB: string
  overlapMinutes: number
}

type TimedBlock = {
  id: string
  title: string
  startMs: number
  endMs: number
}

function overlaps(a: TimedBlock, b: TimedBlock, bufferMinutes: number): boolean {
  const buf = bufferMinutes * 60_000
  return a.startMs - buf < b.endMs + buf && b.startMs - buf < a.endMs + buf
}

/** Detect overlapping program selections and manual busy blocks for one account. */
export function detectPersonalScheduleConflicts(
  blocks: TimedBlock[],
  bufferMinutes: number,
): PersonalConflictWarning[] {
  const sorted = [...blocks].sort((x, y) => x.startMs - y.startMs)
  const out: PersonalConflictWarning[] = []
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]!
      const b = sorted[j]!
      if (b.startMs >= a.endMs + bufferMinutes * 60_000) break
      if (!overlaps(a, b, bufferMinutes)) continue
      const overlapStart = Math.max(a.startMs, b.startMs)
      const overlapEnd = Math.min(a.endMs, b.endMs)
      const overlapMinutes = Math.max(0, Math.round((overlapEnd - overlapStart) / 60_000))
      if (overlapMinutes <= 0) continue
      out.push({
        slotIdA: a.id,
        slotIdB: b.id,
        titleA: a.title,
        titleB: b.title,
        overlapMinutes,
      })
    }
  }
  return out
}
