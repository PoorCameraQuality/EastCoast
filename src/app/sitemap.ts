import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getAllArticles } from '@/data/education'
import { supabase } from '@/lib/supabase'
import { BASE_URL } from '@/lib/seo'

export default async function sitemap() {
  const baseUrl = BASE_URL
  
  // Get all events, dungeons, and articles
  const events = getAllEvents()
  const dungeons = getAllDungeons()
  const staticArticles = getAllArticles()
  
  // Get database articles from Supabase with timeout and fallback
  let databaseArticles: any[] = []
  try {
    if (supabase) {
      // Add timeout to prevent sitemap from hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase fetch timeout')), 1500)
      })
      
      const fetchPromise = supabase
        .from('articles')
        .select('slug, publish_date, last_updated')
        .eq('status', 'published')
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any
      
      if (data && !error) {
        databaseArticles = data
      } else {
        console.warn('Sitemap: Failed to fetch DB articles, continuing with static only:', error)
      }
    }
  } catch (error) {
    console.error('Sitemap: Supabase fetch failed or timed out, continuing with static content only:', error)
    // Continue with empty databaseArticles array - sitemap still works with static content
  }
  
  // Filter to only include upcoming/current events (past events waste crawl budget)
  const now = new Date()
  const upcomingEvents = events.filter(event => new Date(event.date.end) >= now)
  
  // Generate event URLs with enhanced metadata
  const eventUrls = upcomingEvents.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: new Date(event.date.start),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
    alternates: {
      canonical: `${baseUrl}/events/${event.slug}`,
    },
  }))

  // Generate dungeon URLs with enhanced metadata
  const dungeonUrls = dungeons.map((dungeon) => ({
    url: `${baseUrl}/dungeons/${dungeon.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
    alternates: {
      canonical: `${baseUrl}/dungeons/${dungeon.slug}`,
    },
  }))

  // Generate static education article URLs (only published articles)
  const staticArticleUrls = staticArticles
    .filter((article) => article.status === 'published')
    .map((article) => ({
      url: `${baseUrl}/education/${article.slug}`,
      lastModified: new Date(article.lastUpdated || article.publishDate),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        canonical: `${baseUrl}/education/${article.slug}`,
      },
    }))

  // Generate database education article URLs
  const databaseArticleUrls = databaseArticles.map((article) => ({
    url: `${baseUrl}/education/${article.slug}`,
    lastModified: new Date(article.last_updated || article.publish_date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: {
      canonical: `${baseUrl}/education/${article.slug}`,
    },
  }))

  // Combine all article URLs
  const allArticleUrls = [...staticArticleUrls, ...databaseArticleUrls]

  const urls = [
    // Main pages with high priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
      alternates: {
        canonical: baseUrl,
      },
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        canonical: `${baseUrl}/events`,
      },
    },
    {
      url: `${baseUrl}/dungeons`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        canonical: `${baseUrl}/dungeons`,
      },
    },
    {
      url: `${baseUrl}/education`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        canonical: `${baseUrl}/education`,
      },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        canonical: `${baseUrl}/about`,
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        canonical: `${baseUrl}/privacy`,
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        canonical: `${baseUrl}/terms`,
      },
    },
    // Dynamic content pages
    ...eventUrls,
    ...dungeonUrls,
    ...allArticleUrls,
  ]

  // Exclude utility routes (noindex pages)
  return urls.filter(item => {
    try { 
      return item.url && 
        !item.url.endsWith('/login') && 
        !item.url.endsWith('/unauthorized') &&
        !item.url.endsWith('/contact') &&
        !item.url.endsWith('/guidelines') &&
        !item.url.endsWith('/calendar') &&
        !item.url.endsWith('/education/submit')
    } catch { return true }
  })
} 
