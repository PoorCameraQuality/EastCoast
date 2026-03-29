import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/auth/', '/login', '/unauthorized', '/debug', '/debug-simple', '/test-article', '/admin-test', '/api/', '/_next/static/', '/education/submit'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
