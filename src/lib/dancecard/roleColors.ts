/**
 * Deterministic role / track colors for staff shifts and program chips.
 */

export type RoleColor = { bg: string; fg: string; ring: string }

const MOD: RoleColor = { bg: 'bg-violet-300/10', fg: 'text-violet-100', ring: 'ring-violet-200/20' }
const TAXI: RoleColor = { bg: 'bg-amber-300/10', fg: 'text-amber-100', ring: 'ring-amber-200/20' }
const TRACK: RoleColor = { bg: 'bg-blue-300/10', fg: 'text-blue-100', ring: 'ring-blue-200/20' }

const FALLBACK: RoleColor[] = [
  { bg: 'bg-amber-300/10', fg: 'text-amber-100', ring: 'ring-amber-200/20' },
  { bg: 'bg-lime-300/10', fg: 'text-lime-100', ring: 'ring-lime-200/20' },
  { bg: 'bg-rose-300/10', fg: 'text-rose-100', ring: 'ring-rose-200/20' },
  { bg: 'bg-amber-300/10', fg: 'text-amber-100', ring: 'ring-amber-200/20' },
  { bg: 'bg-blue-300/10', fg: 'text-blue-100', ring: 'ring-blue-200/20' },
  { bg: 'bg-violet-300/10', fg: 'text-violet-100', ring: 'ring-violet-200/20' },
  { bg: 'bg-rose-300/10', fg: 'text-rose-100', ring: 'ring-rose-200/20' },
  { bg: 'bg-emerald-300/10', fg: 'text-emerald-100', ring: 'ring-emerald-200/20' },
]

function hashLabel(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * @param role — staff role label, program track, or "track" fallback
 */
export function roleColor(role: string | null | undefined): RoleColor {
  const r = (role ?? '').trim()
  if (!r) return TRACK
  const key = r.toLowerCase()

  if (key.startsWith('mod')) return MOD
  if (key.startsWith('taxi')) return TAXI
  if (key.includes('strike')) return { bg: 'bg-slate-300/10', fg: 'text-slate-100', ring: 'ring-slate-200/20' }
  if (key.includes('build crew')) return { bg: 'bg-orange-300/10', fg: 'text-orange-100', ring: 'ring-orange-200/20' }
  if (key.startsWith('hq')) return { bg: 'bg-amber-300/10', fg: 'text-amber-100', ring: 'ring-amber-200/20' }
  if (key.startsWith('floater')) return { bg: 'bg-emerald-300/10', fg: 'text-emerald-100', ring: 'ring-emerald-200/20' }
  if (key.startsWith('registration')) return { bg: 'bg-blue-300/10', fg: 'text-blue-100', ring: 'ring-blue-200/20' }
  if (key.startsWith('burrow')) return { bg: 'bg-rose-300/10', fg: 'text-rose-100', ring: 'ring-rose-200/20' }
  if (key.includes('presenter') && key.includes('liaison'))
    return { bg: 'bg-violet-300/10', fg: 'text-violet-100', ring: 'ring-violet-200/20' }

  // Program tracks (organizer grid + attendee chips) — use solid-enough fills for dark grids
  if (key === 'classes' || key === 'class')
    return { bg: 'bg-blue-600/55', fg: 'text-blue-50', ring: 'border-blue-400/70' }
  if (key === 'play' || key === 'dungeon')
    return { bg: 'bg-violet-600/55', fg: 'text-violet-50', ring: 'border-violet-400/70' }
  if (key === 'social' || key === 'community')
    return { bg: 'bg-amber-600/50', fg: 'text-amber-50', ring: 'border-amber-400/70' }

  return FALLBACK[hashLabel(r) % FALLBACK.length]
}
