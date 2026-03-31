import type { BlogPillarSlug } from '@/lib/blogPillarRegistry'

/**
 * Overlapping topics: `/blog` pillars are funnel/SEO landers; some angles already have
 * long-form editorial in `/education` (Supabase). Link readers to the education piece as
 * the deeper canonical when both exist—does not set HTML canonical tags (different intents).
 */
export const BLOG_PILLAR_TO_EDUCATION_SLUG: Partial<Record<BlogPillarSlug, string>> = {
  'bdsm-safety-guide': 'ssc-vs-rack-kink-safety-frameworks',
  'what-is-bdsm': 'the-origin-of-bdsm',
}

export function getEducationDeepDiveForBlogPillar(slug: BlogPillarSlug): string | undefined {
  return BLOG_PILLAR_TO_EDUCATION_SLUG[slug]
}
