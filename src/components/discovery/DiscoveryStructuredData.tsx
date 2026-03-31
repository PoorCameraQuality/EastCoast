import { BASE_URL } from '@/lib/seo'

type Props = {
  urlPath: string
  name: string
  description: string
}

export default function DiscoveryStructuredData({ urlPath, name, description }: Props) {
  const url = `${BASE_URL}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description: description.slice(0, 320),
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'East Coast Kink Events',
      url: BASE_URL,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
