/**
 * Legacy Squarespace `/kinkeducationcenter/:slug` URLs → canonical `/blog` pillar slugs.
 * Unmapped slugs fall through to `/education/:slug` (Supabase articles) in middleware.
 *
 * Targets must exist in `BLOG_PILLAR_SLUGS` / `src/content/blog/pillars/*.md`.
 */
export const LEGACY_KINK_EDUCATION_TO_BLOG: Readonly<Record<string, string>> = {
  // Play & social
  pickupplay: 'what-is-a-play-party',

  // Consent & safety
  consent101: 'bdsm-safety-guide',
  'consent-101': 'bdsm-safety-guide',
  bdsmstoplightsystem: 'bdsm-safety-guide',
  'bdsm-stoplight-system': 'bdsm-safety-guide',
  'bdsm-breast-torture': 'bdsm-safety-guide',
  'is-bdsm-legal': 'bdsm-safety-consent-events',
  'are-bdsm-dungeons-legal': 'what-is-a-bdsm-dungeon',
  'ssc-vs-rack-kink-safety-frameworks': 'bdsm-safety-guide',

  // Foundations & roles
  'the-origin-of-bdsm': 'what-is-bdsm',
  'bdsm-10-submission-types': 'bdsm-beginner-guide',
  '50-bdsm-roles-and-playstyles': 'bdsm-beginner-guide',
  'the-subtle-or-not-so-subtle-art-of-mental-bdsm': 'bdsm-beginner-guide',
  'relationship-rules-boundaries-agreements': 'bdsm-beginner-guide',

  // Seasonal / events roundups → pillar seasonal guides
  'hottest-bdsm-events-of-summer-2024': 'summer-kink-events-east-coast',
  'the-hottest-kink-events-for-winter-2024-2025': 'winter-kink-events-east-coast',
  '2025s-hottest-kink-events-a-year': 'how-to-find-kink-events-near-me',
}

export function getLegacyKinkEducationBlogRedirect(slug: string): string | null {
  return LEGACY_KINK_EDUCATION_TO_BLOG[slug] ?? null
}
