import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import EventCard from '@/components/EventCard'
import FAQ from '@/components/FAQ'
import SpiritualityKinkItemListStructuredData from '@/components/spirituality-kink/SpiritualityKinkItemListStructuredData'
import SpiritualityKinkRelatedNav from '@/components/spirituality-kink/SpiritualityKinkRelatedNav'
import {
  CURATED_SPOTLIGHT_ANGLE,
  CURATED_SPOTLIGHT_EVENT_SLUGS,
  getCuratedSpotlightEvents,
} from '@/lib/curatedSpotlightEvents'
import type { CuratedSpotlightSlug } from '@/lib/curatedSpotlightEvents'
import { spokePath, SPIRITUALITY_KINK_BASE } from '@/lib/spiritualityKinkProgrammatic'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

function isSpotlightSlug(s: string): s is CuratedSpotlightSlug {
  return (CURATED_SPOTLIGHT_EVENT_SLUGS as readonly string[]).includes(s)
}

export async function generateMetadata(): Promise<Metadata> {
  const title =
    'Sacred kink, conscious sexuality & spiritual BDSM events — East Coast directory'
  const description =
    'Editorial directory for the kink and spirituality intersection: conscious kink retreats, sacred sexuality gatherings, and rope embodiment—featuring Primal Arts Festival, THE Beltane, and Elevation Rope on East Coast Kink Events.'
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `${BASE_URL}${SPIRITUALITY_KINK_BASE}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}${SPIRITUALITY_KINK_BASE}`,
      siteName: 'East Coast Kink Events',
      type: 'website',
    },
  }
}

export default async function SpiritualityKinkHubPage() {
  const events = await getCuratedSpotlightEvents()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Spirituality & kink', href: SPIRITUALITY_KINK_BASE, current: true },
  ]

  const faqItems = [
    {
      question: 'What is “sacred kink” or “conscious kink” in this context?',
      answer:
        'People use many names—sacred sexuality, conscious BDSM, spiritual kink, ritual kink—to describe events where consent-forward kink, embodiment, and sometimes ritual or seasonal community practice overlap. This is not a medical or religious claim; it is how communities describe their own programming. ECKE lists real events with dates and locations so you can compare what is actually being offered.',
    },
    {
      question: 'Why only three events in this directory?',
      answer:
        'This subsection is a curated editorial cluster, not the full ECKE database. It highlights three recurring gatherings that often surface in searches for sacred sexuality, Beltane-adjacent ritual camping, and intensive rope education. The main calendar at /events lists the broader region.',
    },
    {
      question: 'How is this different from FetLife or Eventbrite?',
      answer:
        'FetLife blocks search engines from indexing most event discovery. Eventbrite has scale, but pages are often thin. This hub pairs human-written context with structured listings and outbound links to official organizer sites—always verify tickets and policies there.',
    },
    {
      question: 'Does “primal” here mean the fitness brand “Primal Play”?',
      answer:
        'No. When we discuss primal expression in a kink context—especially on our East Coast conscious kink overview—we mean BDSM/kink community usage (e.g. primal play as a kink dynamic), not unrelated fitness or gaming brands. Primal Arts Festival is a named camping festival; read the listing for its actual programming.',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <SpiritualityKinkItemListStructuredData
        path={SPIRITUALITY_KINK_BASE}
        name="Sacred kink and conscious sexuality — featured East Coast gatherings"
        description="Curated ItemList of Primal Arts Festival, THE Beltane, and Elevation Rope with links to full ECKE event pages."
        events={events}
      />
      <article className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Sacred kink, conscious sexuality & spiritual BDSM events
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            <strong className="text-white">Short answer:</strong> This is an editorial hub for people searching
            conscious kink retreats, sacred sexuality workshops, and ritual-forward camping—grounded in real,
            date-stamped listings on East Coast Kink Events, not generic filler.
          </p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 mb-12">
          <section aria-labelledby="sec-why">
            <h2 id="sec-why" className="font-serif text-2xl text-white">
              Why this intersection shows up in search (and why directories matter)
            </h2>
            <p>
              Many people look for{' '}
              <strong className="text-white">sacred kink events</strong>,{' '}
              <strong className="text-white">spiritual BDSM retreats</strong>, or{' '}
              <strong className="text-white">conscious sexuality festivals</strong> and find scattered blog posts
              or individual teachers—not a calendar they can trust. FetLife’s event surfaces are largely walled
              off from Google. Large ticketing platforms rank for head terms, but pages are often thin repeats of
              titles and dates. A niche directory can win on specificity: clear consent framing, transparent
              geography, and links to official registration.
            </p>
            <p>
              East Coast Kink Events already publishes dozens of listings; this section narrows the lens to{' '}
              <strong className="text-white">three anchor gatherings</strong> that repeatedly come up when readers
              ask about spirituality-adjacent kink on the corridor from the Mid-Atlantic through the Southeast:
              Primal Arts Festival and THE Beltane (Maryland campground culture) and Elevation Rope (North Carolina
              rope conference). Each has a different emphasis—do not assume they are interchangeable.
            </p>
          </section>

          <section aria-labelledby="sec-how">
            <h2 id="sec-how" className="font-serif text-2xl text-white">
              How we write about wellness without pretending this is therapy
            </h2>
            <p>
              Event producers often use words like <em>embodiment</em>, <em>ritual</em>, <em>sacred</em>, or{' '}
              <em>conscious</em> to signal intent and community norms. That language is authentic to those
              spaces, and it overlaps how people search. ECKE is not a substitute for professional mental health
              care; we describe what organizers advertise—dates, venues, and themes—so you can decide fit for
              yourself. Always read house rules, consent policies, and refund terms on the official site.
            </p>
          </section>

          <section aria-labelledby="sec-regional">
            <h2 id="sec-regional" className="font-serif text-2xl text-white">
              Regional guides (internal links)
            </h2>
            <p>
              For location-specific context and duplicate internal routes for crawlers, use these spokes:{' '}
              <Link href={spokePath('maryland-sacred-kink-gatherings')} className="text-primary-400 hover:underline">
                Maryland sacred kink & ritual gatherings
              </Link>{' '}
              (Primal Arts + THE Beltane),{' '}
              <Link href={spokePath('north-carolina-rope-embodiment')} className="text-primary-400 hover:underline">
                North Carolina rope & embodiment
              </Link>{' '}
              (Elevation Rope), and the{' '}
              <Link href={spokePath('east-coast-conscious-kink')} className="text-primary-400 hover:underline">
                East Coast conscious kink overview
              </Link>{' '}
              (regional framing + “primal play” BDSM disambiguation).
            </p>
          </section>
        </div>

        <section aria-labelledby="sec-listings" className="mb-12">
          <h2 id="sec-listings" className="text-2xl font-serif font-bold text-white mb-6">
            Featured listings (curated)
          </h2>
          {events.length === 0 ? (
            <p className="text-gray-400">Listings unavailable—see the main events calendar.</p>
          ) : (
            <ul className="grid gap-10 md:gap-12 list-none p-0 m-0">
              {events.map((event) => {
                const angle = isSpotlightSlug(event.slug) ? CURATED_SPOTLIGHT_ANGLE[event.slug] : ''
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
                      itemListName="spirituality_kink_hub"
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <SpiritualityKinkRelatedNav current="hub" />

        <section className="mt-12 max-w-3xl">
          <FAQ items={faqItems} title="Frequently asked questions" />
        </section>
      </article>
    </div>
  )
}
