import { BASE_URL } from '@/lib/seo'

type DungeonItem = { name: string; slug: string }

type Props = {
  urlPath: string
  name: string
  description: string
  dungeons: DungeonItem[]
}

export default function DungeonDiscoveryStructuredData({
  urlPath,
  name,
  description,
  dungeons,
}: Props) {
  const path = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
  const url = `${BASE_URL}${path}`
  const webPage = {
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
  const itemList = {
    '@type': 'ItemList',
    name,
    numberOfItems: dungeons.length,
    itemListElement: dungeons.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: d.name,
      url: `${BASE_URL}/dungeons/${d.slug}`,
    })),
  }
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [webPage, itemList],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  )
}
