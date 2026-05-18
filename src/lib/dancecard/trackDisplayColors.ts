import type { CSSProperties } from 'react'

function isHexColor(s: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s.trim())
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace('#', '')
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    }
  }
  if (h.length === 6) {
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
  }
  return null
}

/** Opaque fill: blend track accent into the dancecard elevated surface (no alpha). */
function opaqueCardBackground(rgb: { r: number; g: number; b: number }): string {
  const base = { r: 21, g: 28, b: 39 }
  const mix = 0.42
  const r = Math.round(rgb.r * mix + base.r * (1 - mix))
  const g = Math.round(rgb.g * mix + base.g * (1 - mix))
  const b = Math.round(rgb.b * mix + base.b * (1 - mix))
  return `rgb(${r}, ${g}, ${b})`
}

const PROGRAM_TRACK_PRESETS: Record<string, { bg: string; border: string; accent: string }> = {
  classes: { bg: 'rgb(30, 58, 95)', border: 'rgb(96, 165, 250)', accent: 'rgb(59, 130, 246)' },
  class: { bg: 'rgb(30, 58, 95)', border: 'rgb(96, 165, 250)', accent: 'rgb(59, 130, 246)' },
  play: { bg: 'rgb(59, 38, 92)', border: 'rgb(167, 139, 250)', accent: 'rgb(139, 92, 246)' },
  dungeon: { bg: 'rgb(59, 38, 92)', border: 'rgb(167, 139, 250)', accent: 'rgb(139, 92, 246)' },
  social: { bg: 'rgb(92, 62, 24)', border: 'rgb(251, 191, 36)', accent: 'rgb(245, 158, 11)' },
  community: { bg: 'rgb(92, 62, 24)', border: 'rgb(251, 191, 36)', accent: 'rgb(245, 158, 11)' },
}

const FALLBACK_PRESETS = [
  { bg: 'rgb(22, 78, 72)', border: 'rgb(45, 212, 191)', accent: 'rgb(45, 212, 191)' },
  { bg: 'rgb(54, 72, 28)', border: 'rgb(163, 230, 53)', accent: 'rgb(163, 230, 53)' },
  { bg: 'rgb(88, 28, 48)', border: 'rgb(251, 113, 133)', accent: 'rgb(251, 113, 133)' },
  { bg: 'rgb(30, 58, 95)', border: 'rgb(96, 165, 250)', accent: 'rgb(59, 130, 246)' },
]

function hashLabel(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function presetForTrackName(name: string | null | undefined) {
  const key = (name ?? '').trim().toLowerCase()
  if (key && PROGRAM_TRACK_PRESETS[key]) return PROGRAM_TRACK_PRESETS[key]
  if (!key) return PROGRAM_TRACK_PRESETS.classes
  return FALLBACK_PRESETS[hashLabel(key) % FALLBACK_PRESETS.length]
}

export type SlotCardVisual = {
  className: string
  style: CSSProperties
}

/** Fully opaque card chrome — grid lines must not show through. */
export function slotCardVisual(args: {
  trackColorHex?: string | null
  trackName?: string | null
}): SlotCardVisual {
  const hex = args.trackColorHex?.trim()
  if (hex && isHexColor(hex)) {
    const rgb = hexToRgb(hex)
    if (rgb) {
      return {
        className: 'border text-dc-text shadow-md isolate',
        style: {
          backgroundColor: opaqueCardBackground(rgb),
          borderColor: hex,
          boxShadow: `inset 4px 0 0 0 ${hex}`,
        },
      }
    }
  }

  const preset = presetForTrackName(args.trackName)
  return {
    className: 'border text-dc-text shadow-md isolate',
    style: {
      backgroundColor: preset.bg,
      borderColor: preset.border,
      boxShadow: `inset 4px 0 0 0 ${preset.accent}`,
    },
  }
}
