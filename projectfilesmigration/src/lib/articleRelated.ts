import type { SupabaseClient } from '@supabase/supabase-js'

export interface RelatedArticleSummary {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  featured: boolean
  publish_date: string
}

/**
 * Same selection logic as the former client-only ContinueYourJourney, for SSR/crawlers.
 */
export async function fetchRelatedArticleSummaries(
  client: SupabaseClient,
  current: { id: string; category: string }
): Promise<RelatedArticleSummary[]> {
  let { data: categoryArticles, error: categoryError } = await client
    .from('articles')
    .select('id, title, slug, excerpt, category, featured, publish_date')
    .eq('status', 'published')
    .eq('category', current.category)
    .neq('id', current.id)
    .order('featured', { ascending: false })
    .order('publish_date', { ascending: false })
    .limit(2)

  if (categoryError) {
    console.error('[articleRelated] category articles:', categoryError.message)
    categoryArticles = []
  }

  const cat = categoryArticles || []
  const need = 2 - cat.length
  let additional: RelatedArticleSummary[] = []

  if (need > 0) {
    const { data: recentArticles, error: recentError } = await client
      .from('articles')
      .select('id, title, slug, excerpt, category, featured, publish_date')
      .eq('status', 'published')
      .neq('id', current.id)
      .not('category', 'eq', current.category)
      .order('featured', { ascending: false })
      .order('publish_date', { ascending: false })
      .limit(need)

    if (recentError) {
      console.error('[articleRelated] recent articles:', recentError.message)
    } else if (recentArticles) {
      additional = recentArticles as RelatedArticleSummary[]
    }
  }

  const combined = [...cat, ...additional]
  const unique = combined.filter(
    (row, index, self) => index === self.findIndex((a) => a.id === row.id)
  )
  return unique.slice(0, 2)
}
