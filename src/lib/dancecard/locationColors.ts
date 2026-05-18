type LocationChip = {
  bg: string
  fg: string
  ring: string
  surface: string
  border: string
}

const FIXED_ROOM_COLORS: Record<string, LocationChip> = {
  'all locations': {
    bg: 'bg-slate-500/20',
    fg: 'text-slate-100',
    ring: 'ring-slate-400/30 border-slate-400/35',
    surface: 'bg-slate-500/10',
    border: 'border-slate-400/25',
  },
  'dining hall': {
    bg: 'bg-amber-300/10',
    fg: 'text-amber-100',
    ring: 'ring-amber-200/20 border-amber-200/25',
    surface: 'bg-amber-300/10',
    border: 'border-amber-200/15',
  },
  'dining hall deck': {
    bg: 'bg-orange-300/10',
    fg: 'text-orange-100',
    ring: 'ring-orange-200/20 border-orange-200/25',
    surface: 'bg-orange-300/10',
    border: 'border-orange-200/15',
  },
  'vendor workshop': {
    bg: 'bg-lime-300/10',
    fg: 'text-lime-100',
    ring: 'ring-lime-200/20 border-lime-200/25',
    surface: 'bg-lime-300/10',
    border: 'border-lime-200/15',
  },
  "uggla's forge": {
    bg: 'bg-rose-300/10',
    fg: 'text-rose-100',
    ring: 'ring-rose-200/20 border-rose-200/25',
    surface: 'bg-rose-300/10',
    border: 'border-rose-200/15',
  },
}

const HASH_PALETTE: LocationChip[] = [
  {
    bg: 'bg-blue-300/10',
    fg: 'text-sky-100',
    ring: 'ring-blue-200/20 border-blue-200/25',
    surface: 'bg-blue-300/10',
    border: 'border-blue-200/15',
  },
  {
    bg: 'bg-violet-300/10',
    fg: 'text-violet-100',
    ring: 'ring-violet-200/20 border-violet-200/25',
    surface: 'bg-violet-300/10',
    border: 'border-violet-200/15',
  },
  {
    bg: 'bg-rose-300/10',
    fg: 'text-rose-100',
    ring: 'ring-rose-200/20 border-rose-200/25',
    surface: 'bg-rose-300/10',
    border: 'border-rose-200/15',
  },
  {
    bg: 'bg-emerald-300/10',
    fg: 'text-emerald-100',
    ring: 'ring-emerald-200/20 border-emerald-200/25',
    surface: 'bg-emerald-300/10',
    border: 'border-emerald-200/15',
  },
  {
    bg: 'bg-stone-300/10',
    fg: 'text-stone-200',
    ring: 'ring-stone-200/20 border-stone-200/25',
    surface: 'bg-stone-300/10',
    border: 'border-stone-200/15',
  },
  {
    bg: 'bg-indigo-300/10',
    fg: 'text-indigo-100',
    ring: 'ring-indigo-200/20 border-indigo-200/25',
    surface: 'bg-indigo-300/10',
    border: 'border-indigo-200/15',
  },
]

function hashCode(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function locationColor(room: string | null | undefined): LocationChip {
  const name = (room ?? '').trim()
  if (!name) {
    return {
      bg: 'bg-slate-500/20',
      fg: 'text-slate-100',
      ring: 'ring-slate-400/30 border-slate-400/35',
      surface: 'bg-slate-500/10',
      border: 'border-slate-400/25',
    }
  }
  const key = name.toLowerCase()
  if (FIXED_ROOM_COLORS[key]) return FIXED_ROOM_COLORS[key]
  return HASH_PALETTE[hashCode(key) % HASH_PALETTE.length]
}
