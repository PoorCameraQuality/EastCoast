import { BASE_URL } from '@/lib/seo'
import type { EventPageRecord } from '@/lib/unifiedEvents'

const PAGE_PATH = '/community-spotlight'

function escapeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/**
 * ItemList JSON-LD for the curated three-event hub (supplements FAQ + breadcrumb on the page).
 */
export default function CommunitySpotlightStructuredData({
  events,
}: {
  events: Pick<EventPageRecord, 'name' | 'slug' | 'date'>[]
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Community spotlight — featured kink gatherings',
    description:
      'Curated East Coast Kink Events listings: Primal Arts Festival, THE Beltane, and Elevation Rope.',
    url: `${BASE_URL}${PAGE_PATH}`,
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

  return (
    <script
      id="community-spotlight-itemlist-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonLd(structuredData) }}
    />
  )
}
