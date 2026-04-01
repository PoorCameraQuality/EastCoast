/** FAQ copy for `/states/[state]` — parameterized, safe framing for search snippets. */
export function buildStateHubFaqs(stateName: string, region: string) {
  return [
    {
      question: `What does the ${stateName} directory include?`,
      answer: `This hub lists upcoming kink-friendly events, BDSM and play spaces, and swing and lifestyle clubs we currently have on file for ${stateName}. Counts change as listings are added or dates pass—always confirm details with organizers and venues.`,
    },
    {
      question: 'How should I verify an event or venue before I go?',
      answer:
        'Use official websites, ticketing pages, and direct contact for hours, pricing, dress codes, and consent policies. ECKE summarizes public information; it is not a substitute for the venue’s or producer’s own rules.',
    },
    {
      question: `Is ${stateName} the only state you cover?`,
      answer: `We list venues and events across North America; this page focuses on ${stateName} (${region}). Use the state links on this site to browse other regions.`,
    },
    {
      question: 'Where can I read beginner-friendly guides?',
      answer:
        'Start with the education library and blog pillars on this site—topics include consent, what to expect at a kink event, and how to find events near you.',
    },
  ]
}
