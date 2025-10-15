import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/login', '/unauthorized', '/debug', '/debug-simple', '/test-article', '/admin-test', '/api/', '/_next/', '/education/submit'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://www.eastcoastkinkevents.com/sitemap.xml',
  }
}
