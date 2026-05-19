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

/** Parchment elevated surface (#f4f0e8) — blend track accent for readable cards on light chrome. */
const PARCHMENT_BASE = { r: 244, g: 240, b: 232 }

function opaqueCardBackground(rgb: { r: number; g: number; b: number }): string {
  const mix = 0.28
  const r = Math.round(rgb.r * mix + PARCHMENT_BASE.r * (1 - mix))
  const g = Math.round(rgb.g * mix + PARCHMENT_BASE.g * (1 - mix))
  const b = Math.round(rgb.b * mix + PARCHMENT_BASE.b * (1 - mix))
  return `rgb(${r}, ${g}, ${b})`
}

/** Light tints for parchment program grid (dark text via text-dc-text). */
const PROGRAM_TRACK_PRESETS: Record<string, { bg: string; border: string; accent: string }> = {
  classes: { bg: 'rgb(232, 238, 252)', border: 'rgb(59, 130, 246)', accent: 'rgb(59, 130, 246)' },
  class: { bg: 'rgb(232, 238, 252)', border: 'rgb(59, 130, 246)', accent: 'rgb(59, 130, 246)' },
  play: { bg: 'rgb(240, 232, 252)', border: 'rgb(139, 92, 246)', accent: 'rgb(139, 92, 246)' },
  dungeon: { bg: 'rgb(240, 232, 252)', border: 'rgb(139, 92, 246)', accent: 'rgb(139, 92, 246)' },
  social: { bg: 'rgb(252, 242, 220)', border: 'rgb(180, 130, 40)', accent: 'rgb(139, 105, 20)' },
  community: { bg: 'rgb(252, 242, 220)', border: 'rgb(180, 130, 40)', accent: 'rgb(139, 105, 20)' },
}

const FALLBACK_PRESETS = [
  { bg: 'rgb(224, 244, 240)', border: 'rgb(45, 140, 120)', accent: 'rgb(45, 140, 120)' },
  { bg: 'rgb(236, 244, 220)', border: 'rgb(100, 140, 50)', accent: 'rgb(100, 140, 50)' },
  { bg: 'rgb(252, 228, 236)', border: 'rgb(190, 80, 110)', accent: 'rgb(190, 80, 110)' },
  { bg: 'rgb(232, 238, 252)', border: 'rgb(59, 130, 246)', accent: 'rgb(59, 130, 246)' },
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
