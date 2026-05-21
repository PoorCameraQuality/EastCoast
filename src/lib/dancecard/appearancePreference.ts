import { DEFAULT_DANCECARD_APPEARANCE, type DancecardAppearanceId } from '@/lib/dancecard/appearancePresets'

export const DANCECARD_APPEARANCE_STORAGE_KEY = 'ecke-dancecard-appearance'

const VALID_IDS = new Set<string>([
  'parchment',
  'midnight-brass',
  'lifted-ink',
  'coastal-slate',
  'high-noon',
])

export function readStoredAppearance(): DancecardAppearanceId {
  if (typeof window === 'undefined') return DEFAULT_DANCECARD_APPEARANCE
  try {
    const raw = window.localStorage.getItem(DANCECARD_APPEARANCE_STORAGE_KEY)
    if (raw && VALID_IDS.has(raw)) return raw as DancecardAppearanceId
  } catch {
    /* ignore */
  }
  return DEFAULT_DANCECARD_APPEARANCE
}

export function writeStoredAppearance(id: DancecardAppearanceId): void {
  try {
    window.localStorage.setItem(DANCECARD_APPEARANCE_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}
