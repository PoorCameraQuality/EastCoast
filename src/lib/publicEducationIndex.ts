import type { ExternalResource } from '@/components/education/ExternalResourceCard'
import { LEARNING_PATHS } from '@/lib/educationLearningPaths'
import {
  categoryToTopic,
  formatReadTimeLabel,
  formatTags,
  parseEducationLevel,
  parseReadTimeMinutes,
  topicToLegacyCategory,
} from '@/lib/educationVisual'
import type { EducationArticle } from '@/lib/educationArticles'
import { resolveArticleOgImageUrl } from '@/lib/articleSeo'
import { resolveDualReadHeroUrl } from '@/lib/kinkSocialPhotoManifest'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
import type {
  EducationContentLane,
  EducationTopic,
  PublicEducationItem,
  PublicEducatorPreview,
  LearningPathDefinition,
} from '@/types/publicEducationItem'

const PLATFORM_UPDATE_SLUGS = new Set([
  'ecke-publish-is-online-and-ready-for-testing',
  'kink-social-alpha-testing',
])

const PLATFORM_TITLE_PATTERNS = [
  /ecke publish/i,
  /platform update/i,
  /alpha test/i,
  /ready for testing/i,
  /kink\.social launch/i,
]

function slugifyAuthor(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function isPlatformUpdateArticle(article: EducationArticle): boolean {
  if (PLATFORM_UPDATE_SLUGS.has(article.slug)) return true
  if (article.category?.trim().toLowerCase() === 'platform') return true

  const tags = formatTags(article.tags).map((t) => t.toLowerCase())
  if (tags.some((t) => t.includes('platform') || t.includes('ecke publish') || t.includes('alpha'))) {
    return true
  }

  return PLATFORM_TITLE_PATTERNS.some((p) => p.test(article.title))
}

function inferContentType(article: EducationArticle, lane: EducationContentLane): PublicEducationItem['contentType'] {
  if (lane === 'platform_update') return 'platform_update'
  const tags = formatTags(article.tags).map((t) => t.toLowerCase())
  if (tags.some((t) => t.includes('guide'))) return 'guide'
  return 'article'
}

function buildKinkSocialUrls(article: EducationArticle) {
  const kinkSocialArticleUrl =
    article.kink_social_canonical_url?.trim() ||
    (article.c2k_source_id
      ? buildKinkSocialUrl(`${KINK_SOCIAL_PATHS.educationBrowse}/${article.slug}`, 'education_article')
      : undefined)

  const kinkSocialAuthorUrl =
    article.author_profile_url?.trim() ||
    article.presenter_profile_url?.trim() ||
    (article.author_username
      ? buildKinkSocialUrl(`/u/${article.author_username}`, 'education_article')
      : undefined)

  const saveUrl = kinkSocialArticleUrl
    ? buildKinkSocialUrl(kinkSocialArticleUrl.replace(/^https?:\/\/[^/]+/, ''), 'education_article', {
        utm_content: 'save_article',
      })
    : undefined

  const followAuthorUrl = kinkSocialAuthorUrl
    ? buildKinkSocialUrl(kinkSocialAuthorUrl.replace(/^https?:\/\/[^/]+/, ''), 'education_article', {
        utm_content: 'follow_educator',
      })
    : undefined

  return { kinkSocialArticleUrl, kinkSocialAuthorUrl, saveUrl, followAuthorUrl }
}

export function articleToPublicItem(article: EducationArticle): PublicEducationItem {
  const lane: EducationContentLane = isPlatformUpdateArticle(article) ? 'platform_update' : 'library'
  const topic = categoryToTopic(article.category)
  const tags = formatTags(article.tags)
  const readTimeMinutes = parseReadTimeMinutes(article.read_time)
  const level = parseEducationLevel(article.difficulty)
  const urls = buildKinkSocialUrls(article)
  const dualReadHero = resolveDualReadHeroUrl(article.heroMediaPublicUrl, article.og_image)
  const heroImageUrl = dualReadHero ?? resolveArticleOgImageUrl(article.og_image, article.content)

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.excerpt,
    summary: article.excerpt,
    body: article.content,

    contentType: inferContentType(article, lane),
    topic,
    lane,

    level,
    readTimeMinutes,
    readTimeLabel: formatReadTimeLabel(readTimeMinutes, article.read_time),
    tags,
    contentWarnings: Array.isArray(article.content_warnings)
      ? article.content_warnings.filter((w) => w.trim())
      : undefined,

    authorName: article.author_name,
    authorSlug: article.author_username ?? slugifyAuthor(article.author_name),
    authorRole: article.author_credentials ?? undefined,
    presenterProfileUrl: article.presenter_profile_url ?? undefined,

    heroImageUrl: heroImageUrl.includes('/og-image.png') ? undefined : heroImageUrl,

    kinkSocialArticleUrl: urls.kinkSocialArticleUrl,
    kinkSocialAuthorUrl: urls.kinkSocialAuthorUrl,
    saveUrl: urls.saveUrl,
    followAuthorUrl: urls.followAuthorUrl,

    sourceSystem: article.c2k_source_id ? 'kink_social' : 'ecke',
    sourceId: article.c2k_source_id ?? undefined,
    sourceAttribution: article.source_attribution ?? undefined,
    lastSyncedAt: article.last_synced_at ?? undefined,

    featured: article.featured,
    publishDate: article.publish_date,
    status: 'published',
  }
}

export function externalResourceToPublicItem(resource: ExternalResource): PublicEducationItem {
  const topic = categoryToTopic(resource.category)

  return {
    id: resource.id,
    slug: resource.id,
    title: resource.title,
    summary: resource.teaser,
    contentType: 'resource_link',
    topic,
    lane: 'resource',
    tags: [resource.category],
    externalSourceName: resource.source,
    sourceUrl: resource.url,
    sourceSystem: 'external',
    status: 'published',
  }
}

export function buildEducationIndex(articles: EducationArticle[]): PublicEducationItem[] {
  return articles.map(articleToPublicItem)
}

export function splitByLane(items: PublicEducationItem[]) {
  const library: PublicEducationItem[] = []
  const resources: PublicEducationItem[] = []
  const platformUpdates: PublicEducationItem[] = []

  for (const item of items) {
    if (item.lane === 'platform_update') platformUpdates.push(item)
    else if (item.lane === 'resource') resources.push(item)
    else library.push(item)
  }

  return { library, resources, platformUpdates }
}

export function filterByTopic(items: PublicEducationItem[], topic: EducationTopic | 'all'): PublicEducationItem[] {
  if (topic === 'all') return items
  const legacy = topicToLegacyCategory(topic)
  return items.filter((item) => {
    if (item.topic === topic) return true
    if (legacy && item.tags?.includes(legacy)) return true
    return false
  })
}

export function pickFeaturedGuides(items: PublicEducationItem[], limit = 6): PublicEducationItem[] {
  const featured = items.filter((i) => i.featured)
  const pool = featured.length >= limit ? featured : [...featured, ...items.filter((i) => !i.featured)]
  return pool.slice(0, limit)
}

function matchesPath(item: PublicEducationItem, path: LearningPathDefinition): boolean {
  const haystack = [
    item.title,
    item.summary ?? '',
    item.slug,
    ...(item.tags ?? []),
  ]
    .join(' ')
    .toLowerCase()

  if (path.categories.some((c) => item.tags?.includes(c) || topicToLegacyCategory(item.topic) === c)) {
    return true
  }

  if (path.tagKeywords.some((kw) => haystack.includes(kw.toLowerCase()))) return true
  if (path.slugKeywords.some((kw) => item.slug.includes(kw))) return true

  return path.topicHints.includes(item.topic)
}

export function articlesForLearningPath(
  path: LearningPathDefinition,
  libraryItems: PublicEducationItem[]
): PublicEducationItem[] {
  return libraryItems.filter((item) => matchesPath(item, path)).slice(0, 12)
}

export function countForLearningPath(path: LearningPathDefinition, libraryItems: PublicEducationItem[]): number {
  return libraryItems.filter((item) => matchesPath(item, path)).length
}

export function topicCounts(items: PublicEducationItem[]): Partial<Record<EducationTopic, number>> {
  const counts: Partial<Record<EducationTopic, number>> = {}
  for (const item of items) {
    counts[item.topic] = (counts[item.topic] ?? 0) + 1
  }
  return counts
}

export function buildEducatorPreviews(libraryItems: PublicEducationItem[]): PublicEducatorPreview[] {
  const byAuthor = new Map<string, PublicEducatorPreview>()

  for (const item of libraryItems) {
    if (!item.authorName?.trim()) continue
    const slug = item.authorSlug ?? slugifyAuthor(item.authorName)
    const existing = byAuthor.get(slug)
    const topics = new Set(existing?.topics ?? [])
    topics.add(item.topic)

    byAuthor.set(slug, {
      slug,
      name: item.authorName,
      role: item.authorRole ?? existing?.role,
      avatarUrl: item.authorAvatarUrl ?? existing?.avatarUrl,
      topics: Array.from(topics),
      articleCount: (existing?.articleCount ?? 0) + 1,
      profileUrl: item.kinkSocialAuthorUrl ?? item.presenterProfileUrl ?? existing?.profileUrl,
      followUrl: item.followAuthorUrl ?? existing?.followUrl,
    })
  }

  return Array.from(byAuthor.values())
    .filter((e) => e.articleCount > 0)
    .sort((a, b) => b.articleCount - a.articleCount || a.name.localeCompare(b.name))
    .slice(0, 8)
}

export function attachLearningPath(
  item: PublicEducationItem,
  libraryItems: PublicEducationItem[]
): PublicEducationItem {
  for (const path of LEARNING_PATHS) {
    const pathArticles = articlesForLearningPath(path, libraryItems)
    const index = pathArticles.findIndex((a) => a.slug === item.slug)
    if (index >= 0) {
      return { ...item, learningPathSlug: path.slug, learningPathOrder: index }
    }
  }
  return item
}

export function relatedInLearningPath(
  item: PublicEducationItem,
  libraryItems: PublicEducationItem[]
): PublicEducationItem[] {
  if (!item.learningPathSlug) return []
  const path = LEARNING_PATHS.find((p) => p.slug === item.learningPathSlug)
  if (!path) return []
  const pathArticles = articlesForLearningPath(path, libraryItems)
  const idx = pathArticles.findIndex((a) => a.slug === item.slug)
  if (idx < 0) return []
  const next = pathArticles[idx + 1]
  const prev = pathArticles[idx - 1]
  return [next, prev].filter(Boolean) as PublicEducationItem[]
}

export { LEARNING_PATHS }
