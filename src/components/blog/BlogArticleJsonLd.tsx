import { BASE_URL } from '@/lib/seo'

type Props = {
  urlPath: string
  headline: string
  description: string
  /** ISO date for BlogPosting */
  datePublished?: string
  variant: 'blogPosting' | 'webPage'
}

export default function BlogArticleJsonLd({
  urlPath,
  headline,
  description,
  datePublished,
  variant,
}: Props) {
  const path = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
  const url = `${BASE_URL}${path}`
  const desc = description.slice(0, 320)

  const node =
    variant === 'blogPosting'
      ? {
          '@type': 'BlogPosting',
          headline,
          description: desc,
          url,
          datePublished: datePublished || new Date().toISOString().slice(0, 10),
          publisher: {
            '@type': 'Organization',
            name: 'East Coast Kink Events',
            url: BASE_URL,
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        }
      : {
          '@type': 'WebPage',
          name: headline,
          description: desc,
          url,
          isPartOf: { '@type': 'WebSite', name: 'East Coast Kink Events', url: BASE_URL },
        }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [node],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  )
}
