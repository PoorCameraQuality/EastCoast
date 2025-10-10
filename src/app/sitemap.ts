import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getAllArticles } from '@/data/education'
import { supabase } from '@/lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://www.eastcoastkinkevents.com'
  
  // Get all events, dungeons, and articles
  const events = getAllEvents()
  const dungeons = getAllDungeons()
  const staticArticles = getAllArticles()
  
  // Get database articles from Supabase
  let databaseArticles: any[] = []
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('articles')
        .select('slug, publish_date, last_updated')
        .eq('status', 'published')
      
      if (data && !error) {
        databaseArticles = data
      }
    }
  } catch (error) {
    console.warn('Failed to fetch database articles for sitemap:', error)
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
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: {
        canonical: `${baseUrl}/calendar`,
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
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        canonical: `${baseUrl}/contact`,
      },
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        canonical: `${baseUrl}/guidelines`,
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
    {
      url: `${baseUrl}/education/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
      alternates: {
        canonical: `${baseUrl}/education/submit`,
      },
    },
    // Removed: login and unauthorized from sitemap to avoid noindex conflicts
    // Dynamic content pages
    ...eventUrls,
    ...dungeonUrls,
    ...allArticleUrls,
  ]

  // Exclude utility routes
  return urls.filter(item => {
    try { return item.url && !item.url.endsWith('/login') && !item.url.endsWith('/unauthorized') } catch { return true }
  })
} 
