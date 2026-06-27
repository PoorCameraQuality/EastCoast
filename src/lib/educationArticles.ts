import { getAllArticles, getArticleBySlug as getStaticArticleBySlug } from '@/data/education'
import { fetchRelatedArticleSummaries, type RelatedArticleSummary } from '@/lib/articleRelated'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export type EducationArticle = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author_name: string
  author_credentials?: string
  author_bio?: string
  category: string
  tags?: string | string[]
  featured: boolean
  status: string
  publish_date: string
  last_updated?: string
  read_time?: string
  seo_title?: string
  meta_description?: string
  focus_keywords?: string[] | string
  og_image?: string | null
  hero_media_asset_id?: string | null
  heroMediaPublicUrl?: string | null
  content_warnings?: string[] | null
  difficulty?: string | null
  author_username?: string | null
  author_profile_url?: string | null
  presenter_profile_url?: string | null
  kink_social_canonical_url?: string | null
  source_attribution?: string | null
  last_synced_at?: string | null
  c2k_source_type?: string | null
  c2k_source_id?: string | null
}

function normalizeStaticArticle(raw: Record<string, unknown>): EducationArticle {
  const author = raw.author as { name?: string; credentials?: string; bio?: string } | undefined
  const seo = raw.seo as { title?: string; description?: string; keywords?: string[] } | undefined

  return {
    id: String(raw.id),
    title: String(raw.title),
    slug: String(raw.slug),
    excerpt: String(raw.excerpt),
    content: String(raw.content),
    author_name: author?.name ?? 'East Coast Kink Events',
    author_credentials: author?.credentials,
    author_bio: author?.bio,
    category: String(raw.category),
    tags: raw.tags as string | string[] | undefined,
    featured: Boolean(raw.featured),
    status: String(raw.status ?? 'published'),
    publish_date: String(raw.publishDate ?? raw.publish_date ?? ''),
    last_updated: String(raw.lastUpdated ?? raw.last_updated ?? ''),
    read_time: String(raw.readTime ?? raw.read_time ?? ''),
    seo_title: seo?.title,
    meta_description: seo?.description,
    focus_keywords: seo?.keywords,
    og_image: null,
  }
}

function getStaticPublishedArticles(): EducationArticle[] {
  return getAllArticles().map((a) => normalizeStaticArticle(a as Record<string, unknown>))
}

async function attachHeroMediaPublicUrls(articles: EducationArticle[]): Promise<EducationArticle[]> {
  const client = getSupabaseServerClient()
  if (!client) return articles

  const heroIds = [...new Set(articles.map((a) => a.hero_media_asset_id).filter(Boolean))] as string[]
  if (heroIds.length === 0) return articles

  const { data, error } = await client
    .from('kink_social_media_assets')
    .select('id, public_url')
    .in('id', heroIds)

  if (error || !data) return articles

  const byId = new Map(data.map((row) => [row.id as string, row.public_url as string]))
  return articles.map((article) => ({
    ...article,
    heroMediaPublicUrl: article.hero_media_asset_id ? byId.get(article.hero_media_asset_id) ?? null : null,
  }))
}

async function fetchFromSupabase(): Promise<EducationArticle[] | null> {
  const client = getSupabaseServerClient()
  if (!client) return null

  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })

  if (error) {
    console.error('[educationArticles] Supabase fetch failed:', error.message)
    return null
  }

  return attachHeroMediaPublicUrls((data as EducationArticle[]) || [])
}

/** Published articles: Supabase when available, else static seed data from @/data/education. */
export async function getPublishedEducationArticles(): Promise<EducationArticle[]> {
  const remote = await fetchFromSupabase()
  if (remote && remote.length > 0) return remote

  const staticArticles = getStaticPublishedArticles()
  if (staticArticles.length > 0) {
    if (!remote) {
      console.warn('[educationArticles] Using static education fallback (Supabase empty or unavailable).')
    }
    return staticArticles
  }

  return remote ?? []
}

export async function getPublishedEducationArticleBySlug(
  slug: string
): Promise<EducationArticle | null> {
  const client = getSupabaseServerClient()
  if (client) {
    const { data, error } = await client
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (!error && data) {
      const [withHero] = await attachHeroMediaPublicUrls([data as EducationArticle])
      return withHero
    }
    if (error) {
      console.error('[educationArticles] Supabase slug fetch failed:', error.message)
    }
  }

  const staticArticle = getStaticArticleBySlug(slug)
  if (!staticArticle) return null
  return normalizeStaticArticle(staticArticle as Record<string, unknown>)
}

export async function getPublishedEducationSlugs(): Promise<string[]> {
  const articles = await getPublishedEducationArticles()
  return articles.map((a) => a.slug).filter(Boolean)
}

export async function fetchRelatedEducationSummaries(current: {
  id: string
  category: string
}): Promise<RelatedArticleSummary[]> {
  const client = getSupabaseServerClient()
  if (client) {
    return fetchRelatedArticleSummaries(client, current)
  }

  const all = getStaticPublishedArticles()
  const sameCategory = all
    .filter((a) => a.id !== current.id && a.category === current.category)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 2)

  const need = 2 - sameCategory.length
  const additional =
    need > 0
      ? all
          .filter((a) => a.id !== current.id && a.category !== current.category)
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, need)
      : []

  return [...sameCategory, ...additional].map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    category: a.category,
    featured: a.featured,
    publish_date: a.publish_date,
  }))
}
