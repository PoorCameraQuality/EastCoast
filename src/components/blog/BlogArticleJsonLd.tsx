import { BASE_URL } from '@/lib/seo'

type Props = {
  urlPath: string
  headline: string
  description: string
  /** ISO date for BlogPosting */
  datePublished?: string
  variant: 'blogPosting' | 'webPage'
  /** Absolute or site-root image URL for rich results */
  imageUrl?: string
  authorName?: string
}

export default function BlogArticleJsonLd({
  urlPath,
  headline,
  description,
  datePublished,
  variant,
  imageUrl,
  authorName,
}: Props) {
  const path = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
  const url = `${BASE_URL}${path}`
  const desc = description.slice(0, 320)
  const resolvedImage = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
    : `${BASE_URL}/og-image.png`

  const node =
    variant === 'blogPosting'
      ? {
          '@type': 'BlogPosting',
          headline,
          description: desc,
          url,
          image: resolvedImage,
          datePublished: datePublished || new Date().toISOString().slice(0, 10),
          ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
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
