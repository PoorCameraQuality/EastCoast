import { getUnifiedEvents, getUpcomingUnified } from '@/lib/unifiedEvents'
import HomeUpcomingEventsGrid, { type HomeEventRow } from '@/components/home/HomeUpcomingEventsGrid'

function toHomeEventRow(e: Awaited<ReturnType<typeof getUnifiedEvents>>[number]): HomeEventRow {
  return {
    name: e.name,
    slug: e.slug,
    date: e.date,
    location: {
      city: e.location.city,
      state: e.location.state,
      region: e.location.region || `${e.location.city}, ${e.location.state}`,
    },
    excerpt: e.excerpt,
    category: e.category,
    logo: e.logo,
  }
}

export default async function HomeUpcomingEvents() {
  const unified = await getUnifiedEvents()
  const upcoming = getUpcomingUnified(unified).slice(0, 16).map(toHomeEventRow)

  if (upcoming.length === 0) {
    return (
      <section className="bg-black pb-8" aria-labelledby="home-upcoming-events-title">
        <div className="container-custom">
          <h2 id="home-upcoming-events-title" className="font-serif text-2xl font-bold text-white">
            On the calendar
          </h2>
          <p className="mt-4 text-gray-400">No upcoming events listed right now. Check back soon or browse past listings.</p>
        </div>
      </section>
    )
  }

  return <HomeUpcomingEventsGrid events={upcoming} />
}
