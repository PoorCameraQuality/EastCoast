import { BASE_URL } from '@/lib/seo'

const DEFAULT_OG = `${BASE_URL}/og-image.png`

function absolutizeAssetUrl(url: string): string {
  const u = url.trim()
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  if (u.startsWith('/')) return `${BASE_URL}${u}`
  return `${BASE_URL}/${u.replace(/^\//, '')}`
}

/** First <img src> or markdown ![](...) in content; returns absolute URL or null. */
export function extractFirstImageUrlFromContent(content: string | null | undefined): string | null {
  if (!content) return null
  const img = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (img?.[1]) return absolutizeAssetUrl(img[1])
  const md = content.match(/!\[[^\]]*]\(([^)]+)\)/)
  if (md?.[1]) return absolutizeAssetUrl(md[1].trim())
  return null
}

export function resolveArticleOgImageUrl(
  ogImage: string | null | undefined,
  content: string | null | undefined
): string {
  if (ogImage?.trim()) {
    return absolutizeAssetUrl(ogImage)
  }
  return extractFirstImageUrlFromContent(content) || DEFAULT_OG
}

function stripTagsForWordCount(raw: string): string {
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function countWordsFromArticleContent(content: string | null | undefined): number {
  if (!content) return 0
  const text = stripTagsForWordCount(content)
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
}
