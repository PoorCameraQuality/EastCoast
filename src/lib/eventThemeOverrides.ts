import type { EventBrandTheme, EventBrandTreatment } from '@/lib/eventBrandTheme'

type ThemeOverride = EventBrandTheme

function theme(
  primary: string,
  secondary: string,
  accent: string,
  glow: string,
  surface: string,
  treatment: EventBrandTreatment,
  textOnMedia: 'light' | 'dark' = 'light',
): ThemeOverride {
  return { primary, secondary, accent, glow, surface, treatment, textOnMedia }
}

/** Curated atmospheres for flagship events — applied before color extraction. */
const EXACT: Record<string, ThemeOverride> = {
  'dark-odyssey-summer-camp': theme(
    '#2a2830',
    '#0c0b0e',
    '#b8bcc8',
    '#5c4d78',
    '#121018',
    'monochrome',
  ),
  'dark-odyssey-winter-fire': theme(
    '#1e1c24',
    '#08080a',
    '#d4d0dc',
    '#4a4060',
    '#0e0d12',
    'monochrome',
  ),
  tesfest: theme('#7a1515', '#120404', '#ececec', '#c62828', '#180606', 'glow'),
  'naughty-gras': theme('#4a2d6b', '#1a1028', '#d4af37', '#9b59b6', '#140e1c', 'colorwash'),
  'naughty-nat': theme('#1a3a5c', '#0a1520', '#c9a227', '#2e6da4', '#0c1824', 'colorwash'),
  'chicago-fetish-weekend-2026': theme(
    '#e8e8e8',
    '#0a0a0a',
    '#ffffff',
    '#666666',
    '#111111',
    'monochrome',
  ),
  'elevation-rope': theme('#4a7c82', '#1e3336', '#b8ddd4', '#6ba89e', '#152628', 'colorwash'),
  'ropecraft-chicago': theme('#e0e0e0', '#101010', '#ffffff', '#555555', '#0d0d0d', 'monochrome'),
  'mid-atlantic-leather-weekend': theme('#8b1c1c', '#140606', '#f0e6d8', '#c0392b', '#1a0808', 'glow'),
}

const PREFIX: { prefix: string; theme: ThemeOverride }[] = [
  { prefix: 'dark-odyssey', theme: EXACT['dark-odyssey-summer-camp']! },
  { prefix: 'naughty-', theme: EXACT['naughty-gras']! },
]

export function getEventThemeOverride(slug: string): ThemeOverride | null {
  if (EXACT[slug]) return EXACT[slug]
  for (const { prefix, theme: t } of PREFIX) {
    if (slug.startsWith(prefix)) return t
  }
  return null
}
