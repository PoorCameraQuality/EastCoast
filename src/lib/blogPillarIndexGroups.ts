import { BLOG_PILLAR_SLUGS, type BlogPillarSlug } from '@/lib/blogPillarRegistry'

export type BlogPillarIndexGroup = {
  id: string
  title: string
  description: string
  slugs: readonly BlogPillarSlug[]
}

/** Order and headings for `/blog` pillar list. Every pillar slug must appear exactly once. */
export const BLOG_PILLAR_INDEX_GROUPS: readonly BlogPillarIndexGroup[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    description:
      'Core vocabulary, safety, consent frameworks, and what a first night out can look like—where we usually send newcomers first.',
    slugs: [
      'what-is-bdsm',
      'bdsm-beginner-guide',
      'bdsm-safety-guide',
      'what-to-expect-at-a-kink-event',
    ],
  },
  {
    id: 'events-community',
    title: 'Finding events & community',
    description:
      'How to discover munches, parties, dungeons, and conventions; what to expect; rope classes; and consent in real venues.',
    slugs: [
      'how-to-find-kink-events-near-me',
      'what-to-expect-first-bdsm-convention',
      'what-is-a-munch-bdsm',
      'what-is-a-play-party',
      'what-is-a-bdsm-dungeon',
      'bdsm-safety-consent-events',
      'guide-to-rope-bondage-workshops',
    ],
  },
  {
    id: 'spirituality-primal',
    title: 'Spirituality & primal play',
    description:
      'Sacred kink, conscious practice, and raw instinct-driven play—plus where those ideas meet East Coast events.',
    slugs: ['what-is-sacred-kink', 'can-kink-be-spiritual-practice', 'what-is-primal-play-bdsm'],
  },
  {
    id: 'seasonal',
    title: 'Seasonal calendar',
    description:
      'How the East Coast scene shifts by season—outdoor festivals, hotel cons, workshop seasons, and planning ahead.',
    slugs: [
      'spring-kink-events-east-coast',
      'summer-kink-events-east-coast',
      'fall-kink-events-east-coast',
      'winter-kink-events-east-coast',
    ],
  },
] as const

const _seen = new Set<BlogPillarSlug>()
for (const g of BLOG_PILLAR_INDEX_GROUPS) {
  for (const s of g.slugs) {
    if (_seen.has(s)) {
      throw new Error(`[blogPillarIndexGroups] duplicate slug in groups: ${s}`)
    }
    _seen.add(s)
  }
}
if (_seen.size !== BLOG_PILLAR_SLUGS.length) {
  const missing = BLOG_PILLAR_SLUGS.filter((s) => !_seen.has(s))
  throw new Error(
    `[blogPillarIndexGroups] missing slugs (add to a group): ${missing.join(', ')}`
  )
}
