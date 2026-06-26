import type { EducationLevel, LearningPathDefinition } from '@/types/publicEducationItem'

export const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    slug: 'new-to-kink',
    title: 'New to kink',
    promise: 'Understand terms, norms, and how to explore without rushing into intensity.',
    level: 'beginner',
    topicHints: ['beginner', 'consent', 'safety'],
    categories: ['Education', 'Safety', 'Consent'],
    tagKeywords: ['beginner', 'new', 'introduction', '101', 'basics'],
    slugKeywords: ['beginner', '101', 'what-is', 'introduction'],
  },
  {
    slug: 'consent-and-negotiation',
    title: 'Consent and negotiation',
    promise: 'Build clear agreements, boundaries, and ongoing check-ins before and during play.',
    level: 'beginner',
    topicHints: ['consent', 'safety'],
    categories: ['Consent', 'Safety'],
    tagKeywords: ['consent', 'negotiation', 'boundaries', 'limits'],
    slugKeywords: ['consent', 'negotiation', 'boundaries'],
  },
  {
    slug: 'first-event',
    title: 'Going to your first event',
    promise: 'Know what to expect, what to bring, and how to show up prepared at munches and parties.',
    level: 'beginner',
    topicHints: ['community', 'beginner'],
    categories: ['Community', 'Education'],
    tagKeywords: ['event', 'munch', 'party', 'first', 'etiquette'],
    slugKeywords: ['event', 'munch', 'first-time', 'expect'],
  },
  {
    slug: 'finding-community',
    title: 'Finding local community',
    promise: 'Locate groups, venues, and vetted spaces where you can connect safely.',
    level: 'beginner',
    topicHints: ['community', 'resources'],
    categories: ['Community', 'Resources'],
    tagKeywords: ['community', 'local', 'group', 'directory', 'kap'],
    slugKeywords: ['community', 'kap', 'directory', 'local'],
  },
  {
    slug: 'safety-and-risk',
    title: 'Safety and risk awareness',
    promise: 'Learn frameworks like SSC and RACK, vetting habits, and harm-reduction basics.',
    level: 'beginner',
    topicHints: ['safety', 'consent'],
    categories: ['Safety'],
    tagKeywords: ['safety', 'ssc', 'rack', 'risk', 'vetting', 'abuse'],
    slugKeywords: ['safety', 'ssc', 'rack', 'abuse', 'risk'],
  },
  {
    slug: 'gear-and-technique',
    title: 'Gear and technique basics',
    promise: 'Start with foundational skills, equipment care, and anatomy-aware practice.',
    level: 'intermediate',
    topicHints: ['technique', 'gear'],
    categories: ['Techniques', 'Education'],
    tagKeywords: ['technique', 'gear', 'rope', 'impact', 'skill'],
    slugKeywords: ['technique', 'gear', 'rope', 'impact'],
  },
  {
    slug: 'presenter-resources',
    title: 'Presenter and educator resources',
    promise: 'Tools for teaching, class design, and building credibility as a public educator.',
    level: 'intermediate',
    topicHints: ['presenter', 'beginner'],
    categories: ['Education'],
    tagKeywords: ['presenter', 'educator', 'class', 'workshop', 'teaching'],
    slugKeywords: ['presenter', 'educator', 'class', 'workshop'],
  },
  {
    slug: 'organizer-venue',
    title: 'Organizer and venue education',
    promise: 'Guidance for running safer events, venue policies, and community accountability.',
    level: 'advanced',
    topicHints: ['organizer', 'community', 'legal'],
    categories: ['Community', 'Legal', 'Education'],
    tagKeywords: ['organizer', 'venue', 'policy', 'event', 'liability'],
    slugKeywords: ['organizer', 'venue', 'policy'],
  },
]

export function getLearningPathBySlug(slug: string): LearningPathDefinition | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug)
}

export function levelLabel(level: EducationLevel): string {
  switch (level) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    case 'all_levels':
      return 'All levels'
  }
}
