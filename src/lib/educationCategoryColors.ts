/** Shared category styling for education index tabs, cards, and article pages. */

export function getCategoryColorClass(category: string): string {
  switch (category) {
    case 'Safety':
      return 'bg-gradient-to-r from-red-600 to-red-700'
    case 'Techniques':
      return 'bg-gradient-to-r from-primary-600 to-primary-700'
    case 'Community':
      return 'bg-gradient-to-r from-emerald-600 to-emerald-800'
    case 'Resources':
      return 'bg-gradient-to-r from-violet-600 to-violet-800'
    case 'Consent':
      return 'bg-gradient-to-r from-amber-500 to-amber-700'
    case 'Education':
      return 'bg-gradient-to-r from-sky-600 to-sky-800'
    case 'Identity':
      return 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-900'
    case 'Aftercare':
      return 'bg-gradient-to-r from-rose-600 to-rose-900'
    case 'Mental Health':
      return 'bg-gradient-to-r from-cyan-600 to-cyan-900'
    case 'Legal':
      return 'bg-gradient-to-r from-slate-600 to-slate-800'
    default:
      return 'bg-gradient-to-r from-slate-600 to-slate-800'
  }
}

const CATEGORY_TAB_PALETTES: Record<string, { on: string; off: string }> = {
  Safety: {
    on: 'border-red-400 bg-red-600/90 text-white shadow-md shadow-red-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-red-500/40',
  },
  Consent: {
    on: 'border-amber-300 bg-amber-500 text-black shadow-md shadow-amber-900/20',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-amber-400/40',
  },
  Techniques: {
    on: 'border-primary-400 bg-primary-600 text-white shadow-md shadow-primary-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-primary-500/40',
  },
  Community: {
    on: 'border-emerald-400 bg-emerald-700 text-white shadow-md shadow-emerald-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-emerald-500/40',
  },
  Resources: {
    on: 'border-violet-400 bg-violet-700 text-white shadow-md shadow-violet-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-violet-500/40',
  },
  Education: {
    on: 'border-sky-400 bg-sky-800 text-white shadow-md shadow-sky-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-sky-500/40',
  },
  Identity: {
    on: 'border-fuchsia-400 bg-fuchsia-900/80 text-white shadow-md shadow-fuchsia-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-fuchsia-500/40',
  },
  Aftercare: {
    on: 'border-rose-400 bg-rose-900/70 text-white shadow-md shadow-rose-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-rose-500/40',
  },
  'Mental Health': {
    on: 'border-cyan-400 bg-cyan-900/70 text-white shadow-md shadow-cyan-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-cyan-500/40',
  },
  Legal: {
    on: 'border-slate-300 bg-slate-700 text-white shadow-md shadow-slate-900/30',
    off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-slate-400/40',
  },
}

const DEFAULT_TAB_PALETTE = {
  on: 'border-primary-400 bg-primary-700 text-white shadow-md shadow-primary-900/20',
  off: 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-primary-500/35',
}

const TAB_BASE_CLASS =
  'shrink-0 snap-start min-h-touch rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition duration-200'

/** Filter pill styles for the education index category toolbar. */
export function getCategoryTabClass(category: string, selected: boolean): string {
  const palette = CATEGORY_TAB_PALETTES[category] ?? DEFAULT_TAB_PALETTE
  return `${TAB_BASE_CLASS} ${selected ? palette.on : palette.off}`
}

export const EDUCATION_CATEGORY_ORDER = [
  'Safety',
  'Consent',
  'Techniques',
  'Community',
  'Resources',
  'Education',
  'Identity',
  'Aftercare',
  'Mental Health',
  'Legal',
] as const

export type EducationCategory = (typeof EDUCATION_CATEGORY_ORDER)[number]

export function isKnownEducationCategory(category: string): category is EducationCategory {
  return (EDUCATION_CATEGORY_ORDER as readonly string[]).includes(category)
}

/** Sort key: known categories first (in EDUCATION_CATEGORY_ORDER), then alphabetical. */
export function sortEducationCategories(categories: Iterable<string>): string[] {
  const set = new Set<string>()
  for (const c of categories) {
    if (c?.trim()) set.add(c.trim())
  }
  const preferred = EDUCATION_CATEGORY_ORDER.filter((c) => set.has(c))
  const rest = Array.from(set)
    .filter((c) => !isKnownEducationCategory(c))
    .sort((a, b) => a.localeCompare(b))
  return [...preferred, ...rest]
}
