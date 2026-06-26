import 'server-only'

import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import type { EventMedia } from '@/lib/eventMedia'
import { primaryMediaUrl } from '@/lib/eventMedia'
import {
  fallbackTheme,
  themeFromRgb,
  type EventBrandTheme,
  type EventBrandTreatment,
  type Rgb,
} from '@/lib/eventBrandTheme'
import { getEventThemeOverride } from '@/lib/eventThemeOverrides'

const CACHE_KEY = '__eckeEventBrandThemeCache'

function getCache(): Map<string, EventBrandTheme> {
  const g = globalThis as typeof globalThis & { [CACHE_KEY]?: Map<string, EventBrandTheme> }
  if (!g[CACHE_KEY]) g[CACHE_KEY] = new Map()
  return g[CACHE_KEY]
}

async function loadImageBuffer(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''))
      return await fs.readFile(filePath)
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function extractDominantRgb(buffer: Buffer): Promise<Rgb | null> {
  try {
    const { data } = await sharp(buffer)
      .resize(36, 36, { fit: 'cover' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    let r = 0
    let g = 0
    let b = 0
    let n = 0
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]
      if (alpha < 96) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      n++
    }
    if (n === 0) return null
    return { r: r / n, g: g / n, b: b / n }
  } catch {
    return null
  }
}

export async function deriveEventBrandTheme(
  media: EventMedia,
  slug: string,
  category: string,
): Promise<EventBrandTheme> {
  const cacheKey = `${slug}:${primaryMediaUrl(media) ?? 'none'}`
  const cached = getCache().get(cacheKey)
  if (cached) return cached

  const override = getEventThemeOverride(slug)
  if (override) {
    getCache().set(cacheKey, override)
    return override
  }

  const url = primaryMediaUrl(media)
  let theme: EventBrandTheme

  if (url) {
    const buf = await loadImageBuffer(url)
    const rgb = buf ? await extractDominantRgb(buf) : null
    if (rgb) {
      const treatment: EventBrandTreatment = media.isBanner
        ? 'poster'
        : rgb.r + rgb.g + rgb.b > 520
          ? 'monochrome'
          : 'glow'
      theme = themeFromRgb(rgb, treatment)
    } else {
      theme = fallbackTheme(slug, category)
    }
  } else {
    theme = fallbackTheme(slug, category)
  }

  getCache().set(cacheKey, theme)
  return theme
}
