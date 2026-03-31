import Link from 'next/link'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { getStateSlugFromAbbr, getCityHubSlugForEvent } from '@/lib/eventDiscoveryLinks'

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
  const stateSlug = getStateSlugFromAbbr(event.location.state)
  const citySlug = getCityHubSlugForEvent(event.location.city, event.location.state)
  const text = buildIntroText(event)

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5 md:p-6" aria-labelledby="event-seo-intro-heading">
      <h2 id="event-seo-intro-heading" className="sr-only">
        About this listing
      </h2>
      <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed">
        <p>{text}</p>
        <p className="mt-4 text-sm text-gray-400">
          Explore:{' '}
          {stateSlug && (
            <Link href={`/bdsm-events/${stateSlug}`} className="text-primary-400 hover:underline">
              BDSM events in {EAST_COAST_STATES[stateSlug].name}
            </Link>
          )}
          {stateSlug && citySlug && <span className="mx-2 text-gray-600">·</span>}
          {citySlug && (
            <Link href={`/bdsm-events/${citySlug}`} className="text-primary-400 hover:underline">
              {event.location.city} hub
            </Link>
          )}
          {(stateSlug || citySlug) && <span className="mx-2 text-gray-600">·</span>}
          <Link href="/states" className="text-primary-400 hover:underline">
            All state directories
          </Link>
        </p>
      </div>
    </section>
  )
}
