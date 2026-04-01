import ListingHubLinks from '@/components/seo/ListingHubLinks'

type EventLike = {
  name: string
  excerpt: string
  location: { city: string; state: string }
  category: string
}

function buildIntroText(event: EventLike): string {
  const base = event.excerpt.trim()
  const sentences = base.split(/(?<=[.!?])\s+/).filter(Boolean)
  const picked = sentences.slice(0, 4).join(' ')
  const filler = `${event.name} is listed in ${event.location.city}, ${event.location.state} as a ${event.category.toLowerCase()}. Whether you are traveling from out of state or looking for kink events near you, use the directory hubs below to find related listings and venues in the same region.`
  const combined = `${picked} ${filler}`
  const words = combined.split(/\s+/)
  if (words.length > 280) {
    return words.slice(0, 260).join(' ') + '…'
  }
  if (words.length < 120) {
    return `${combined} We keep this page updated as dates and policies change; confirm details with organizers before you register.`
  }
  return combined
}

export default function EventSeoIntro({ event }: { event: EventLike }) {
  const text = buildIntroText(event)

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 md:p-6" aria-labelledby="event-seo-intro-heading">
      <h2 id="event-seo-intro-heading" className="sr-only">
        About this listing
      </h2>
      <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed">
        <p>{text}</p>
      </div>
      <ListingHubLinks
        variant="event"
        stateAbbr={event.location.state}
        city={event.location.city}
      />
    </section>
  )
}
