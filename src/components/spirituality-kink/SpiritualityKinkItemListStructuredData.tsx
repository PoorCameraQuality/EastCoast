import { BASE_URL } from '@/lib/seo'
import type { EventPageRecord } from '@/lib/unifiedEvents'

function escapeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function SpiritualityKinkItemListStructuredData({
  path,
  name,
  description,
  events,
}: {
  path: string
  name: string
  description: string
  events: Pick<EventPageRecord, 'name' | 'slug' | 'date'>[]
}) {
  const url = `${BASE_URL}${path}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Event',
        name: e.name,
        url: `${BASE_URL}/events/${e.slug}`,
        startDate: e.date.start,
        endDate: e.date.end,
      },
    })),
  }

  const safeId = path.replace(/^\//, '').replace(/\//g, '-') || 'hub'
  return (
    <script
      id={`spirituality-kink-itemlist-${safeId}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonLd(structuredData) }}
    />
  )
}
