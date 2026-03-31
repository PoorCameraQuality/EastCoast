import type { BlogPillarSlug } from '@/lib/blogPillarRegistry'

const BLOG_PILLAR_FAQS: Partial<
  Record<BlogPillarSlug, { question: string; answer: string }[]>
> = {
  'bdsm-beginner-guide': [
    {
      question: 'What should I do before attending my first kink event?',
      answer:
        'Clarify your own goals and limits, choose an entry path that fits (social munch, class, or low-pressure mixer), read the venue’s published rules, and plan to observe before you play. Negotiate explicitly when you do scene: activities, intensity, body areas, safewords, and aftercare.',
    },
    {
      question: 'Is it okay to attend a play party just to watch?',
      answer:
        'Yes. Observation is a normal and respected choice, especially for newcomers. Introduce yourself to staff, ask where to stand so you are not intruding on scenes, and do not touch people or gear without invitation.',
    },
  ],
  'what-is-bdsm': [
    {
      question: 'What does BDSM refer to?',
      answer:
        'BDSM describes a wide range of consensual adult practices—often summarized as bondage and discipline, dominance and submission, and sadism and masochism. Real-world communities emphasize negotiation, risk awareness, and respect for boundaries.',
    },
    {
      question: 'Does liking BDSM mean someone wants the same activities in every context?',
      answer:
        'No. Interests are contextual and relational. What someone enjoys with one partner or at one venue may not carry over elsewhere. Consent and limits are checked for each situation, not assumed from labels.',
    },
  ],
  'bdsm-safety-guide': [
    {
      question: 'What is the difference between SSC and RACK?',
      answer:
        'SSC (“safe, sane, consensual”) and RACK (“risk-aware consensual kink”) are frameworks communities use to talk about ethics and risk. SSC emphasizes reducing harm and sober consent; RACK acknowledges that some activities carry inherent risk and focuses on informed, ongoing consent and skill-building.',
    },
    {
      question: 'Why are safewords and check-ins important?',
      answer:
        'They create a shared stop/slow language when words like “no” might be part of role play. Periodic check-ins (verbal or non-verbal) help partners adjust intensity, catch nerve issues early, and align expectations during longer scenes.',
    },
  ],
  'what-to-expect-at-a-kink-event': [
    {
      question: 'What is the difference between a munch and a play party?',
      answer:
        'A munch is usually a social meetup in a vanilla-appropriate public space to chat and meet people without play. A play party is a private or members-only space where negotiated scenes may occur under house rules, staffing, and consent culture.',
    },
    {
      question: 'Can I say no if someone asks to play?',
      answer:
        'Yes. A polite “no thank you” is complete. You do not owe anyone a play session, an explanation, or a debate. Good venues back your right to refuse without pressure.',
    },
  ],
}

export function getBlogPillarFaqs(slug: BlogPillarSlug): { question: string; answer: string }[] {
  return BLOG_PILLAR_FAQS[slug] ?? []
}
