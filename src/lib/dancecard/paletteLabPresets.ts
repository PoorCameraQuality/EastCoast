import {
  DANCECARD_APPEARANCE_PRESETS,
  getAppearancePreset,
  type DancecardAppearancePreset,
} from '@/lib/dancecard/appearancePresets'

export type PalettePreset = {
  id: string
  name: string
  tagline: string
  bestFor: string
  vars: Record<string, string>
}

function labVarsFromPreset(p: DancecardAppearancePreset): Record<string, string> {
  const v = p.vars
  return {
    '--dc-surface': v['--dc-surface'] ?? '',
    '--dc-surface-muted': v['--dc-surface-muted'] ?? '',
    '--dc-elevated-solid': v['--dc-elevated-solid'] ?? '',
    '--dc-text': v['--dc-text'] ?? '',
    '--dc-text-muted': v['--dc-text-muted'] ?? '',
    '--dc-muted': v['--dc-muted'] ?? v['--dc-text-muted'] ?? '',
    '--dc-accent': v['--dc-accent'] ?? '',
    '--dc-accent-hover': v['--dc-accent-hover'] ?? '',
    '--dc-accent-muted': v['--dc-accent-muted'] ?? '',
    '--dc-accent-border': v['--dc-accent-border'] ?? '',
    '--dc-accent-foreground': v['--dc-accent-foreground'] ?? '',
    '--dc-border-subtle': v['--dc-border-subtle'] ?? '',
    '--dc-compare-mutual': v['--dc-compare-mutual'] ?? '',
    '--dc-compare-busy': v['--dc-compare-busy'] ?? '',
    '--dc-compare-host-only': v['--dc-compare-host-only'] ?? '',
    '--dc-compare-outside': v['--dc-compare-outside'] ?? '',
  }
}

function toLabPreset(p: DancecardAppearancePreset, id?: string): PalettePreset {
  return {
    id: id ?? p.id,
    name: p.name,
    tagline: p.tagline,
    bestFor: p.bestFor,
    vars: labVarsFromPreset(p),
  }
}

const parchment = getAppearancePreset('parchment')

/** Palette lab + legacy anchor ids (`current`, `noon`, `slate`, `lifted`). */
export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'current',
    name: 'Current — Parchment & Brass',
    tagline: 'Live product default',
    bestFor: parchment.bestFor,
    vars: labVarsFromPreset(parchment),
  },
  toLabPreset(getAppearancePreset('midnight-brass')),
  toLabPreset(getAppearancePreset('parchment'), 'parchment'),
  toLabPreset(getAppearancePreset('high-noon'), 'noon'),
  toLabPreset(getAppearancePreset('coastal-slate'), 'slate'),
  toLabPreset(getAppearancePreset('lifted-ink'), 'lifted'),
  {
    id: 'camp',
    name: 'Camp Day',
    tagline: 'Friendly festival energy (lab only)',
    bestFor: 'Volunteers, outdoor camp weekends',
    vars: {
      '--dc-surface': '#f7f5f0',
      '--dc-surface-muted': '#ede9e0',
      '--dc-elevated-solid': '#ffffff',
      '--dc-text': '#1a2e1f',
      '--dc-text-muted': '#3d5245',
      '--dc-muted': '#3d5245',
      '--dc-accent': '#9a7b2f',
      '--dc-accent-hover': '#7a6224',
      '--dc-accent-muted': '#e8f0ea',
      '--dc-accent-border': '#7a6224',
      '--dc-accent-foreground': '#ffffff',
      '--dc-border-subtle': '#b8c9b8',
      '--dc-compare-mutual': '#2d6a4f',
      '--dc-compare-busy': '#c2410c',
      '--dc-compare-host-only': '#4a6fa5',
    },
  },
]

/** Re-export for settings / docs. */
export { DANCECARD_APPEARANCE_PRESETS }
