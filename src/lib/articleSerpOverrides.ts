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
    seo_title: 'Age Play 101: Consensual Adult Roleplay — Safety & Norms',
    meta_description:
      'Educational overview of consensual adult age play: negotiation, boundaries, privacy, and community context. Safety-first reading from East Coast Kink Events.',
    h1: 'Age Play 101: Consensual Adult Roleplay',
    lead: 'A plain-language, safety-first introduction to consensual adult age play—what people usually mean by it, how negotiation works, and how to engage responsibly in community spaces.',
  },
  'bdsm-breast-torture-play-comprehensive-guide': {
    seo_title: 'Breast & Nipple Play: A Safety-First BDSM Guide',
    meta_description:
      'Consent-focused guide to breast and nipple sensation play: negotiation, anatomy basics, pacing, aftercare, and risk awareness. Educational resource—not explicit content.',
    h1: 'Breast & Nipple Play: A Safety-First Guide',
    lead: 'This guide focuses on consent, anatomy, pacing, and aftercare for breast and nipple sensation play—written for adults who want a sober, educational reference before trying scenes or workshops.',
  },
  'a-to-z-kinks-and-fetishes-guide': {
    seo_title: 'Kinks A–Z: Beginner Glossary (50+ Terms, Consent Context)',
    meta_description:
      'Browse 50+ kink and fetish terms A–Z with short definitions and consent-aware context. Free beginner reference from East Coast Kink Events.',
    h1: 'Kinks A–Z: A Beginner’s Glossary',
    lead: 'A consent-aware A–Z glossary of common kinks and fetishes—short definitions, safety context, and links to deeper reading when you want to learn more.',
  },
}

export function getArticleSerpOverride(slug: string): ArticleSerpOverride | undefined {
  return OVERRIDES[slug]
}
