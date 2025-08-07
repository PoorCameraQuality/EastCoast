import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getAllArticles } from '@/data/education'

export default async function sitemap() {
  const baseUrl = 'https://eastcoastkinkevents.com'
  
  // Get all events, dungeons, and articles
  const events = getAllEvents()
  const dungeons = getAllDungeons()
  const articles = getAllArticles()
  
  // Generate event URLs with enhanced metadata
  const eventUrls = events.map((event) => ({
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

  // Generate education article URLs (only published articles)
  const articleUrls = articles
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

  return [
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
      priority: 0.5,
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
    // Dynamic content pages
    ...eventUrls,
    ...dungeonUrls,
    ...articleUrls,
  ]
} 