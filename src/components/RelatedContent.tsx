import Link from 'next/link'
import EventLogo from '@/components/EventLogo'
import DungeonLogo from '@/components/DungeonLogo'

interface RelatedEvent {
  slug: string
  name: string
  date: {
    display: string
  }
  location: {
    city: string
    state: string
  }
  logo?: string
  category: string
}

interface RelatedDungeon {
  slug: string
  name: string
  location: {
    city: string
    state: string
  }
  logo?: string
}

interface RelatedContentProps {
  events?: RelatedEvent[]
  dungeons?: RelatedDungeon[]
  title: string
}

export default function RelatedContent({ events, dungeons, title }: RelatedContentProps) {
  if (!events?.length && !dungeons?.length) return null

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-serif font-semibold text-white mb-8">
        {title}
      </h2>
      
      {events && events.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Related Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <Link 
                key={event.slug}
                href={`/events/${event.slug}`}
                className="card-elegant hover-lift group"
              >
                {event.logo && (
                  <div className="mb-4">
                    <EventLogo 
                      src={event.logo} 
                      alt={`${event.name} logo`}
                      size="small"
                    />
                  </div>
                )}
                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {event.name}
                </h4>
                <p className="text-sm text-subtle mb-2">{event.date.display}</p>
                <p className="text-sm text-subtle">
                  📍 {event.location.city}, {event.location.state}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {dungeons && dungeons.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Nearby Dungeons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dungeons.slice(0, 3).map((dungeon) => (
              <Link 
                key={dungeon.slug}
                href={`/dungeons/${dungeon.slug}`}
                className="card-elegant hover-lift group"
              >
                {dungeon.logo && (
                  <div className="mb-4">
                    <DungeonLogo 
                      src={dungeon.logo} 
                      alt={`${dungeon.name} logo`}
                      size="small"
                    />
                  </div>
                )}
                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {dungeon.name}
                </h4>
                <p className="text-sm text-subtle">
                  📍 {dungeon.location.city}, {dungeon.location.state}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
