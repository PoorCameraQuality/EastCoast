import { BASE_URL } from '@/lib/seo'

const DEFAULT_OG = `${BASE_URL}/og-image.png`

/**
 * Image URL for og:image / Twitter cards / JSON-LD where raster is preferred.
 * Most social crawlers (Discord, Facebook, Slack, etc.) do not reliably support SVG.
 *
 * Convention: for each listing SVG under `public/`, run `npm run build:og-rasters`
 * to ship a 1200×630 companion at the same path with `-og.png` instead of `.svg`.
 * Placeholder and remote SVG fall back to the site default OG image.
 */
export function openGraphListingImageUrl(logo: string | undefined | null): string {
  if (!logo || typeof logo !== 'string' || !logo.trim()) return DEFAULT_OG
  const t = logo.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) {
    if (/\.svg(\?|#|$)/i.test(t)) return DEFAULT_OG
    return t
  }
  const rel = t.startsWith('/') ? t : `/${t}`
  if (/placeholder/i.test(rel)) return DEFAULT_OG

  if (!/\.svg(\?|#|$)/i.test(rel)) {
    return `${BASE_URL}${rel.split('?')[0]}`
  }

  const rasterRel = rel.replace(/\.svg(\?.*)?$/i, '-og.png')
  return `${BASE_URL}${rasterRel.split('?')[0]}`
}

export function openGraphImageObjects(
  logo: string | undefined | null,
  alt: string
): { url: string; width: number; height: number; alt: string }[] {
  const url = openGraphListingImageUrl(logo)
  return [{ url, width: 1200, height: 630, alt }]
}
