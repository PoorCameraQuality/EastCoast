export type EventBrandTreatment = 'clean' | 'glow' | 'poster' | 'monochrome' | 'colorwash'

export type EventBrandTheme = {
  primary: string
  secondary: string
  accent: string
  glow: string
  surface: string
  textOnMedia: 'light' | 'dark'
  treatment: EventBrandTreatment
}

export function eventBrandStyle(theme: EventBrandTheme): Record<string, string> {
  return {
    '--event-primary': theme.primary,
    '--event-secondary': theme.secondary,
    '--event-accent': theme.accent,
    '--event-glow': theme.glow,
    '--event-surface': theme.surface,
  }
}

type Rgb = { r: number; g: number; b: number }

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('')}`
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function darken(rgb: Rgb, amount: number): Rgb {
  return mixRgb(rgb, { r: 7, g: 8, b: 13 }, amount)
}

function saturateForUi(rgb: Rgb): Rgb {
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  const chroma = max - min
  if (chroma < 18) {
    return {
      r: clamp(rgb.r * 0.88 + 8, 0, 255),
      g: clamp(rgb.g * 0.88 + 8, 0, 255),
      b: clamp(rgb.b * 0.88 + 8, 0, 255),
    }
  }
  return {
    r: clamp(rgb.r * 0.92, 0, 255),
    g: clamp(rgb.g * 0.92, 0, 255),
    b: clamp(rgb.b * 0.92, 0, 255),
  }
}

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const sat = s / 100
  const lig = l / 100
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lig - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function themeFromRgb(rgb: Rgb, treatment: EventBrandTreatment): EventBrandTheme {
  const primary = saturateForUi(rgb)
  const secondary = darken(primary, 0.55)
  const accent = mixRgb(primary, { r: 247, g: 244, b: 239 }, 0.25)
  const glow = rgbToHex(mixRgb(primary, { r: 255, g: 255, b: 255 }, 0.15))
  const luminance = 0.2126 * primary.r + 0.7152 * primary.g + 0.0722 * primary.b

  return {
    primary: rgbToHex(primary),
    secondary: rgbToHex(secondary),
    accent: rgbToHex(accent),
    glow,
    surface: rgbToHex(darken(primary, 0.72)),
    textOnMedia: luminance > 150 ? 'dark' : 'light',
    treatment,
  }
}

export function fallbackTheme(slug: string, category: string): EventBrandTheme {
  const h = hashSlug(slug + category)
  const hue = h % 360
  const treatment: EventBrandTreatment =
    /convention|conference|weekend/i.test(category) ? 'glow' : 'colorwash'
  return themeFromRgb(hslToRgb(hue, 42, 48), treatment)
}

export type { Rgb }
