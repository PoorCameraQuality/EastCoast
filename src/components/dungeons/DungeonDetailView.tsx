import { DungeonStructuredData } from '@/components/StructuredData'
import PlaceDetailView from '@/components/places/PlaceDetailView'
import { dungeonToPlaceListing, eventsMatchingPlace } from '@/lib/publicPlaceIndex'
import { getUnifiedEvents } from '@/lib/unifiedEvents'

type Dungeon = {
  name: string
  slug: string
  venueId?: string
  location: { city: string; state: string; address?: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string
  contact?: { phone?: string; email?: string }
  hours?: string
  socialMedia?: Record<string, string | undefined>
  website?: string
  shopUrl?: string
  vendorListingSlug?: string
  images?: string[]
  status?: 'draft' | 'published'
}

export default async function DungeonDetailView({ dungeon }: { dungeon: Dungeon }) {
  const place = dungeonToPlaceListing(dungeon)
  const unifiedEvents = await getUnifiedEvents()
  const upcomingEvents = eventsMatchingPlace(place, unifiedEvents)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Places', href: '/dungeons' },
    { label: dungeon.name, href: `/dungeons/${dungeon.slug}`, current: true },
  ]

  return (
    <PlaceDetailView
      place={place}
      upcomingEvents={upcomingEvents}
      breadcrumbItems={breadcrumbItems}
      structuredData={<DungeonStructuredData dungeon={dungeon} />}
      socialMedia={dungeon.socialMedia}
      relatedDungeon={dungeon}
      leadNotice={
        dungeon.status === 'draft' ? (
          <p className="place-draft-banner" role="status">
            This location is a draft. Visitors will not see it until you publish.
          </p>
        ) : null
      }
    />
  )
}
