import Link from 'next/link'
import { getAllEvents, getEventsByLocation, getEventsByCategory } from '@/data/events'
import { getAllDungeons, getDungeonsByLocation } from '@/data/dungeons'
import EventLogo from './EventLogo'
import DungeonLogo from './DungeonLogo'

interface RelatedContentProps {
  currentEvent?: any
  currentDungeon?: any
  maxItems?: number
}

export default function RelatedContent({ currentEvent, currentDungeon, maxItems = 3 }: RelatedContentProps) {
  let relatedEvents: any[] = []
  let relatedDungeons: any[] = []

  try {
    if (currentEvent && currentEvent.location?.state && currentEvent.category) {
      // Find events in the same location
      const locationEvents = getEventsByLocation(currentEvent.location.state) || []
      const filteredLocationEvents = locationEvents
        .filter(event => event.slug !== currentEvent.slug)
        .slice(0, maxItems)
      
      // Find events in the same category
      const categoryEvents = getEventsByCategory(currentEvent.category) || []
      const filteredCategoryEvents = categoryEvents
        .filter(event => event.slug !== currentEvent.slug)
        .slice(0, maxItems)
      
      // Combine and remove duplicates
      const allRelated = [...filteredLocationEvents, ...filteredCategoryEvents]
      relatedEvents = allRelated
        .filter((event, index, self) => 
          index === self.findIndex(e => e.slug === event.slug)
        )
        .slice(0, maxItems)
    }

    if (currentDungeon && currentDungeon.location?.state && currentDungeon.category) {
      // Find dungeons in the same location
      const locationDungeons = getDungeonsByLocation(currentDungeon.location.state) || []
      const filteredLocationDungeons = locationDungeons
        .filter(dungeon => dungeon.slug !== currentDungeon.slug)
        .slice(0, maxItems)
      
      // Find dungeons in the same category
      const categoryDungeons = getAllDungeons() || []
      const filteredCategoryDungeons = categoryDungeons
        .filter(dungeon => dungeon.category === currentDungeon.category && dungeon.slug !== currentDungeon.slug)
        .slice(0, maxItems)
      
      // Combine and remove duplicates
      const allRelated = [...filteredLocationDungeons, ...filteredCategoryDungeons]
      relatedDungeons = allRelated
        .filter((dungeon, index, self) => 
          index === self.findIndex(d => d.slug === dungeon.slug)
        )
        .slice(0, maxItems)
    }
  } catch (error) {
    console.error('Error loading related content:', error)
    // Return null if there's an error to prevent crashes
    return null
  }

  if (relatedEvents.length === 0 && relatedDungeons.length === 0) {
    return null
  }

  return (
    <div className="mt-12 p-6 bg-dark-900/50 border border-dark-700 rounded-2xl">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">
        Related Content
      </h2>
      
      {relatedEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-primary-300 mb-4">
            Similar Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedEvents.map((event) => (
              <Link 
                key={event.slug} 
                href={`/events/${event.slug}`}
                prefetch={true}
                aria-label={`View ${event.name || 'Event'} details`}
                className="block p-4 bg-dark-800 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  {event.logo && (
                    <EventLogo 
                      src={event.logo}
                      alt={`${event.name || 'Event'} logo`}
                      size="small"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">
                      {event.name || 'Event'}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {event.location?.city || ''}, {event.location?.state || ''}
                    </p>
                    <p className="text-primary-400 text-xs">
                      {event.date?.display || ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedDungeons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-primary-300 mb-4">
            Nearby Dungeons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedDungeons.map((dungeon) => (
              <Link 
                key={dungeon.slug} 
                href={`/dungeons/${dungeon.slug}`}
                prefetch={true}
                aria-label={`View ${dungeon.name || 'Dungeon'} details`}
                className="block p-4 bg-dark-800 border border-dark-600 rounded-lg hover:border-primary-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  {dungeon.logo && (
                    <DungeonLogo 
                      src={dungeon.logo}
                      alt={`${dungeon.name || 'Dungeon'} logo`}
                      size="small"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">
                      {dungeon.name || 'Dungeon'}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {dungeon.location?.city || ''}, {dungeon.location?.state || ''}
                    </p>
                    <p className="text-primary-400 text-xs">
                      {dungeon.category || ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
