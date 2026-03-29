import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/data/education'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { getAllVendors } from '@/data/vendors'
import { getStateSlugsForSitemap } from '@/lib/eastCoastStates'
import { BASE_URL } from '@/lib/seo'

const STATIC_PATHS = [
  '/',
  '/about',
  '/accessibility',
  '/contact',
  '/privacy',
  '/terms',
  '/support',
  '/report',
  '/events',
  '/dungeons',
  '/education',
  '/calendar',
  '/guidelines',
  '/states',
  '/vendors',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : path === '/events' || path === '/vendors' ? 0.9 : 0.8,
    })
  }

  for (const slug of getStateSlugsForSitemap()) {
    entries.push({
      url: `${BASE_URL}/states/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    })
  }

  for (const e of getAllEvents()) {
    entries.push({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    })
  }

  for (const d of getAllDungeons()) {
    entries.push({
      url: `${BASE_URL}/dungeons/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  for (const a of getAllArticles()) {
    entries.push({
      url: `${BASE_URL}/education/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  for (const v of getAllVendors()) {
    entries.push({
      url: `${BASE_URL}/vendors/${v.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    })
  }

  const seen = new Set<string>()
  return entries.filter((e) => {
    if (seen.has(e.url)) return false
    seen.add(e.url)
    return true
  })
}
