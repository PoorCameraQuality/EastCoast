/**
 * Optional SERP copy overrides for high-impression Supabase articles where DB titles/snippets
 * underperform in Search Console. Keys are article `slug` values.
 */
export type ArticleSerpOverride = {
  seo_title?: string
  meta_description?: string
  /** Visible H1 on the article page (optional; defaults to article.title) */
  h1?: string
  /** Replaces excerpt in hero when set (keeps DB excerpt for cards unless you change DB) */
  lead?: string
}

const OVERRIDES: Record<string, ArticleSerpOverride> = {
  'age-play-101-adult-consensual-safe': {
    seo_title: 'Age Play 101: Meaning, Consent & Safety for Adults',
    meta_description:
      'Learn what consensual adult age play means, how negotiation works, and what boundaries, privacy, and safety checks matter before exploring.',
    h1: 'Age Play 101: Meaning, Consent & Safety for Adults',
    lead: 'A plain-language, safety-first introduction to consensual adult age play: what people usually mean by it, how negotiation works, and how to engage responsibly in community spaces.',
  },
  'bdsm-breast-torture-play-comprehensive-guide': {
    seo_title: 'BDSM Breast Torture Guide: Safety, Consent & Aftercare',
    meta_description:
      'A safety-first BDSM breast torture guide covering consent, anatomy basics, pacing, safer tools, red flags, and aftercare for adults.',
    h1: 'BDSM Breast Torture Guide: Safety, Consent & Aftercare',
    lead: 'A safety-first adult guide to breast and nipple sensation play, with practical notes on consent, anatomy, pacing, red flags, and aftercare before scenes or workshops.',
  },
  'a-to-z-kinks-and-fetishes-guide': {
    seo_title: 'Kinks A–Z: Beginner Glossary (50+ Terms, Consent Context)',
    meta_description:
      'Browse 50+ kink and fetish terms A–Z with short definitions and consent-aware context. Free beginner reference from East Coast Kink Events.',
    h1: 'Kinks A–Z: A Beginner’s Glossary',
    lead: 'A consent-aware A–Z glossary of common kinks and fetishes—short definitions, safety context, and links to deeper reading when you want to learn more.',
  },
  '2257-record-keeping-adult-industry-analysis': {
    seo_title: '2257 Record-Keeping Rules: Adult Industry Guide',
    meta_description:
      'Plain-language 2257 record-keeping overview for adult creators and businesses: what records are for, why compliance matters, and when to get legal help.',
    h1: '2257 Record-Keeping Rules: Adult Industry Guide',
    lead: 'A practical overview of 2257 record-keeping for adult-industry creators, organizers, and businesses, with compliance context and reminders to get qualified legal advice.',
  },
  'hottest-kink-events-winter-2024-2025': {
    seo_title: 'Winter Kink Events: Conferences, Parties & Workshops',
    meta_description:
      'Find winter kink events, BDSM conferences, parties, workshops, and community gatherings, with notes on location, timing, and what each event is known for.',
    h1: 'Winter Kink Events: Conferences, Parties & Workshops',
    lead: 'A seasonal guide to winter kink events, BDSM conferences, parties, workshops, and community gatherings, with practical notes on where they happen and what each event is known for.',
  },
}

export function getArticleSerpOverride(slug: string): ArticleSerpOverride | undefined {
  return OVERRIDES[slug]
}
