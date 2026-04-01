import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import EventCard from '@/components/EventCard'
import FAQ from '@/components/FAQ'
import CommunitySpotlightStructuredData from '@/components/community-spotlight/CommunitySpotlightStructuredData'
import {
  CURATED_SPOTLIGHT_ANGLE,
  CURATED_SPOTLIGHT_EVENT_SLUGS,
  getCuratedSpotlightEvents,
} from '@/lib/curatedSpotlightEvents'
import { BASE_URL } from '@/lib/seo'
import type { CuratedSpotlightSlug } from '@/lib/curatedSpotlightEvents'

export const revalidate = 1800

const PATH = '/community-spotlight'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Community spotlight — Primal Arts, THE Beltane, Elevation Rope'
  const description =
    'Three curated East Coast gatherings: Primal Arts Festival, THE Beltane, and Elevation Rope—dates, locations, and links to full listings on East Coast Kink Events.'
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `${BASE_URL}${PATH}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${PATH}`,
      siteName: 'East Coast Kink Events',
      type: 'website',
    },
  }
}

function isSpotlightSlug(s: string): s is CuratedSpotlightSlug {
  return (CURATED_SPOTLIGHT_EVENT_SLUGS as readonly string[]).includes(s)
}

export default async function CommunitySpotlightPage() {
  const events = await getCuratedSpotlightEvents()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Community spotlight', href: PATH, current: true },
  ]

  const faqItems = [
    {
      question: 'Why are these three events highlighted together?',
      answer:
        'They represent different things people search for in overlapping ways: a primal and sacred-sexuality outdoor festival (Primal Arts), a Beltane-season ritual and play retreat (THE Beltane), and a dedicated rope bondage conference (Elevation Rope). Grouping them on one page is editorial curation, not a claim that they are the same kind of event.',
    },
    {
      question: 'Is East Coast Kink Events affiliated with these organizers?',
      answer:
        'No. We list public information and link to official sites for tickets and policies. Always confirm dates, pricing, and rules on the organizer’s website before you register.',
    },
    {
      question: 'Can my event be added to this spotlight?',
      answer:
        'This page is a fixed, small set of listings. Submit your event through the normal event submission flow; it will appear in the main directory if accepted. The spotlight list only changes when we explicitly update the site.',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <CommunitySpotlightStructuredData events={events} />
      <div className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-10 md:mb-14 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Community spotlight
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Three gatherings we often get questions about—each is different. Primal Arts Festival centers
            sacred sexuality, fire, and primal expression. THE Beltane blends seasonal ritual with a large
            on-site playspace. Elevation Rope is an intensive rope and shibari conference in the Blue Ridge.
            Follow each link for full details, dates, and official registration.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Looking for everything we list?{' '}
            <Link href="/events" className="text-primary-400 hover:underline">
              Browse all events
            </Link>
            .
          </p>
        </header>

        {events.length === 0 ? (
          <p className="text-gray-400">
            Spotlight listings are temporarily unavailable. Please visit{' '}
            <Link href="/events" className="text-primary-400 hover:underline">
              /events
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-10 md:gap-12 list-none p-0 m-0">
            {events.map((event) => {
              const angle = isSpotlightSlug(event.slug)
                ? CURATED_SPOTLIGHT_ANGLE[event.slug]
                : ''
              return (
                <li key={event.slug}>
                  {angle ? (
                    <p className="text-sm font-medium text-primary-300/90 mb-3 max-w-2xl">{angle}</p>
                  ) : null}
                  <EventCard
                    event={{
                      name: event.name,
                      slug: event.slug,
                      date: event.date,
                      location: event.location,
                      excerpt: event.excerpt,
                      logo: event.logo,
                      category: event.category,
                    }}
                    itemListName="community_spotlight"
                  />
                </li>
              )
            })}
          </ul>
        )}

        <section className="mt-16 md:mt-20 max-w-3xl">
          <FAQ items={faqItems} title="Questions" />
        </section>
      </div>
    </div>
  )
}
