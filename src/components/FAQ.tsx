'use client'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items: FAQItem[]
  title?: string
  /** When false, no section heading is rendered (use when the parent page already supplies the title). */
  showTitle?: boolean
}

/**
 * FAQ with native <details>/<summary> so answer text stays in the DOM for crawlers
 * (aligns FAQPage JSON-LD with visible page content per Google structured data guidelines).
 */
export default function FAQ({
  items,
  title = 'Frequently Asked Questions',
  showTitle = true,
}: FAQProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="card-elegant">
        {showTitle ? (
          <h2 className="text-2xl font-serif font-semibold text-white mb-6">{title}</h2>
        ) : null}
        <div className="space-y-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="border border-dark-600 rounded-lg group"
              id={`faq-item-${index}`}
            >
              <summary className="w-full min-h-touch px-6 py-4 text-left flex justify-between items-center gap-3 hover:bg-dark-700 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-white font-medium">{item.question}</span>
                <svg
                  className="w-5 h-5 text-primary-400 shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div id={`faq-answer-${index}`} className="px-6 pb-4">
                <p className="text-gray-300 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}
