import { SwingClubStructuredData } from '@/components/StructuredData'
import PlaceDetailView from '@/components/places/PlaceDetailView'
import { findEventsForPlaceListing, swingClubToPlaceListing } from '@/lib/publicPlaceIndex'
import { getUnifiedEvents } from '@/lib/unifiedEvents'

export type SwingFactSource = 'website' | 'directory' | 'mixed'

type Club = {
  name: string
  slug: string
  location: { city: string; state: string; address?: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string
  contact?: { phone?: string; email?: string }
  hours?: string
  byob?: string
  membership?: string
  lastReviewed?: string
  facts?: Array<{ text: string; source: string }>
  socialMedia?: Record<string, string | undefined>
  website?: string
  images?: string[]
}

function formatReviewedDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function factSourceLabel(source: string): string {
  switch (source) {
    case 'website':
      return 'Official site'
    case 'directory':
      return 'Directory notes'
    case 'mixed':
      return 'Site + notes'
    default:
      return source || 'Note'
  }
}

export default async function SwingClubDetailView({ club }: { club: Club }) {
  const place = swingClubToPlaceListing(club)
  const unifiedEvents = await getUnifiedEvents()
  const upcomingEvents = findEventsForPlaceListing(place, unifiedEvents)

  const extraModules = (
    <>
      {club.facts && club.facts.length > 0 ? (
        <section className="place-about" aria-labelledby="swing-facts-heading">
          <h2 id="swing-facts-heading" className="place-section-title">
            Quick facts
          </h2>
          <ul className="place-facts-list">
            {club.facts.map((fact, i) => (
              <li key={`${fact.text}-${i}`} className="place-fact-item">
                <p>{fact.text}</p>
                <span className="place-fact-source">{factSourceLabel(fact.source)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(club.hours || club.byob || club.membership) && (
        <section className="place-about" aria-labelledby="swing-practical-heading">
          <h2 id="swing-practical-heading" className="place-section-title">
            Practical details
          </h2>
          <p className="place-about-disclaimer">From public sources — confirm before you go.</p>
          {club.hours ? (
            <p className="place-dock-fact-muted whitespace-pre-line mt-2">
              <strong className="text-gray-300">Hours:</strong> {club.hours}
            </p>
          ) : null}
          {club.byob ? (
            <p className="place-dock-fact-muted mt-2">
              <strong className="text-gray-300">Drinks:</strong> {club.byob}
            </p>
          ) : null}
          {club.membership ? (
            <p className="place-dock-fact-muted whitespace-pre-line mt-2">
              <strong className="text-gray-300">Entry:</strong> {club.membership}
            </p>
          ) : null}
        </section>
      )}

      <details className="place-more-links">
        <summary>Before you visit</summary>
        <p className="place-about-disclaimer mt-2">
          Many lifestyle venues keep policies in members-only areas or social posts. This page summarizes public
          sources — it is not a substitute for the club&apos;s own rules.
          {club.lastReviewed ? (
            <>
              {' '}
              Last reviewed <time dateTime={club.lastReviewed}>{formatReviewedDate(club.lastReviewed)}</time>.
            </>
          ) : null}
        </p>
      </details>
    </>
  )

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Places', href: '/dungeons' },
    { label: club.name, href: `/swing-clubs/${club.slug}`, current: true },
  ]

  return (
    <PlaceDetailView
      place={place}
      upcomingEvents={upcomingEvents}
      breadcrumbItems={breadcrumbItems}
      structuredData={<SwingClubStructuredData club={club} />}
      socialMedia={club.socialMedia}
      extraModules={extraModules}
      relatedSwingClub={club}
    />
  )
}
