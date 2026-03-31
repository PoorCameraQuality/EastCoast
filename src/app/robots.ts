import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'

/** Paths that should not be crawled (admin, auth, non-public API, noisy internals). */
const SENSITIVE_DISALLOW = [
  '/admin/',
  '/api/',
  '/login',
  '/unauthorized',
  '/debug',
  '/debug-simple',
  '/test-article',
  '/admin-test',
  '/_next/static/',
  '/education/submit',
] as const

/** Explicitly welcome common AI / LLM crawlers with the same visibility rules as default bots. */
const AI_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'Anthropic-ai',
  'ClaudeBot',
  'Claude-Web',
  'Perplexity-User',
  'PerplexityBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'cohere-ai',
  'YouBot',
  'Applebot-Extended',
  'CCBot',
  'Omgilibot',
  'Diffbot',
  'Amazonbot',
  'FacebookExternalHit',
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...SENSITIVE_DISALLOW],
      },
      {
        userAgent: [...AI_USER_AGENTS],
        allow: '/',
        disallow: [...SENSITIVE_DISALLOW],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [...SENSITIVE_DISALLOW],
        crawlDelay: 1,
      },
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/sitemap-directory.xml`],
  }
}
