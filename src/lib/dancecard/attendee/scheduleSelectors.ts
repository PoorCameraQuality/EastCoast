import type { PublicProgramSlotDto } from '@/lib/dancecard/publicProgramSlotsData'

export type SlotLike = Pick<PublicProgramSlotDto, 'id' | 'startsAt' | 'endsAt' | 'title'>

export function slotStartMs(slot: SlotLike): number {
  return new Date(slot.startsAt).getTime()
}

export function slotEndMs(slot: SlotLike): number {
  return new Date(slot.endsAt).getTime()
}

/** Session happening now (inclusive start, exclusive end). */
export function happeningNow(slots: SlotLike[], nowMs: number = Date.now()): SlotLike | null {
  for (const s of slots) {
    const start = slotStartMs(s)
    const end = slotEndMs(s)
    if (nowMs >= start && nowMs < end) return s
  }
  return null
}

/** Next upcoming session after now. */
export function nextUp(slots: SlotLike[], nowMs: number = Date.now()): SlotLike | null {
  let best: SlotLike | null = null
  let bestStart = Infinity
  for (const s of slots) {
    const start = slotStartMs(s)
    if (start > nowMs && start < bestStart) {
      best = s
      bestStart = start
    }
  }
  return best
}

export type PresenterEntry = {
  personId?: string
  sceneName: string
  role: string
  publicBio: string | null
  photoUrl: string | null
  slotIds: string[]
}

/** Index presenters across slots for directory views. */
export function buildPresenterIndex(
  slots: Pick<PublicProgramSlotDto, 'id' | 'presenters'>[],
): PresenterEntry[] {
  const byKey = new Map<string, PresenterEntry>()
  for (const slot of slots) {
    for (const p of slot.presenters ?? []) {
      const key = `${p.personId ?? p.sceneName}::${p.role}`
      const row =
        byKey.get(key) ??
        ({
          personId: p.personId,
          sceneName: p.sceneName,
          role: p.role,
          publicBio: p.publicBio ?? null,
          photoUrl: p.photoUrl ?? null,
          slotIds: [],
        } satisfies PresenterEntry)
      if (!row.slotIds.includes(slot.id)) row.slotIds.push(slot.id)
      byKey.set(key, row)
    }
  }
  return Array.from(byKey.values()).sort((a, b) => a.sceneName.localeCompare(b.sceneName))
}

export function bioExcerpt(bio: string | null | undefined, maxLen = 120): string | null {
  const t = (bio ?? '').trim()
  if (!t) return null
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen).trimEnd()}…`
}
