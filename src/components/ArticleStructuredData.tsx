import { BASE_URL } from '@/lib/seo'
import { countWordsFromArticleContent, resolveArticleOgImageUrl } from '@/lib/articleSeo'
import { resolveDualReadHeroUrl } from '@/lib/kinkSocialPhotoManifest'

export type ArticleStructuredDataArticle = {
  title: string
  slug: string
  excerpt: string
  content?: string
  author_name?: string
  author_bio?: string
  author_credentials?: string
  category: string
  tags?: string[] | string
  focus_keywords?: string[] | string
  og_image?: string | null
  heroMediaPublicUrl?: string | null
  publish_date?: string
  last_updated?: string
  created_at?: string
}

function escapeHtmlInJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function normalizeKeywords(
  focus?: string[] | string,
  tags?: string[] | string
): string[] {
  const raw = focus ?? tags
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean)
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Single source of truth for Article JSON-LD (used on public article pages and admin preview client).
 */
export function ArticleStructuredData({ article }: { article: ArticleStructuredDataArticle }) {
  const preferredOg =
    resolveDualReadHeroUrl(article.heroMediaPublicUrl, article.og_image) ?? article.og_image
  const imageUrl = resolveArticleOgImageUrl(preferredOg, article.content)
  const wordCount = countWordsFromArticleContent(article.content)
  const datePublished = article.publish_date || article.created_at || new Date().toISOString()
  const dateModified = article.last_updated || article.publish_date || article.created_at || datePublished

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished,
    dateModified,
    publisher: {
      '@type': 'Organization',
      name: 'East Coast Kink Events',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/education/${article.slug}`,
    },
    url: `${BASE_URL}/education/${article.slug}`,
    image: imageUrl,
    articleSection: article.category,
    wordCount,
  }

  const kw = normalizeKeywords(article.focus_keywords, article.tags)
  if (kw.length) {
    structuredData.keywords = kw
  }

  const authorName = article.author_name?.trim()
  if (authorName) {
    structuredData.author = {
      '@type': 'Person',
      name: authorName,
      ...(article.author_bio?.trim() ? { description: article.author_bio.trim() } : {}),
      ...(article.author_credentials?.trim() ? { jobTitle: article.author_credentials.trim() } : {}),
    }
  }

  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id={`article-structured-data-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in ArticleStructuredData:', error)
    return null
  }
}
