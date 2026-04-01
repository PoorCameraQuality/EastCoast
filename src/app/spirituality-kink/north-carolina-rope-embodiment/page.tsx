import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import EventCard from '@/components/EventCard'
import FAQ from '@/components/FAQ'
import SpiritualityKinkItemListStructuredData from '@/components/spirituality-kink/SpiritualityKinkItemListStructuredData'
import SpiritualityKinkRelatedNav from '@/components/spirituality-kink/SpiritualityKinkRelatedNav'
import { getCuratedSpotlightEvents } from '@/lib/curatedSpotlightEvents'
import { filterFeaturedEvents, NORTH_CAROLINA_FEATURE_SLUGS, SPIRITUALITY_KINK_BASE, spokePath } from '@/lib/spiritualityKinkProgrammatic'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

const PATH = `${SPIRITUALITY_KINK_BASE}/north-carolina-rope-embodiment`

export async function generateMetadata(): Promise<Metadata> {
  const title = 'North Carolina rope bondage & embodiment — Elevation Rope'
  const description =
    'Elevation Rope in the Blue Ridge: intensive shibari and rope education near Horse Shoe, NC—dates, venue context, and ECKE listing for kink + embodiment searchers.'
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

export default async function NorthCarolinaRopeEmbodimentPage() {
  const all = await getCuratedSpotlightEvents()
  const events = filterFeaturedEvents(all, NORTH_CAROLINA_FEATURE_SLUGS)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Spirituality & kink', href: SPIRITUALITY_KINK_BASE },
    { label: 'North Carolina rope & embodiment', href: PATH, current: true },
  ]

  const faqItems = [
    {
      question: 'Is Elevation Rope a “spirituality” event?',
      answer:
        'It is primarily marketed as an intensive rope bondage education conference with performances and play parties. Community members sometimes describe rope as embodied or meditative; that is personal experience, not a universal label. Use the official site for tracks and prerequisites.',
    },
    {
      question: 'How does this page relate to the Maryland sacred kink pages?',
      answer:
        'This spoke exists because searchers looking for “kink and spirituality” also look for “rope bondage workshops near me” and embodiment language. We link the clusters together for crawlers and readers without claiming the events are the same genre.',
    },
    {
      question: 'What about parking, accessibility, and lodging?',
      answer:
        'Mountain retreats have different constraints than urban venues. Read Elevation Rope’s registration materials for lodging blocks, shuttle notes, and mobility information—ECKE does not replace the registrar.',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <SpiritualityKinkItemListStructuredData
        path={PATH}
        name="North Carolina rope bondage and embodiment — Elevation Rope"
        description="Elevation Rope — Blue Ridge rope conference listing."
        events={events}
      />
      <article className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            North Carolina rope bondage & embodiment — Elevation Rope
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            <strong className="text-white">Short answer:</strong> Elevation Rope is a multi-day rope and shibari
            conference in the Blue Ridge near Horse Shoe, North Carolina. It is the rope-focused anchor in our
            spirituality-and-kink cluster—not because every attendee frames rope as spiritual, but because search
            demand overlaps “embodiment,” “somatic,” and intensive rope education.
          </p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 mb-12">
          <section>
            <h2 className="font-serif text-2xl text-white">Why rope shows up next to “spirituality” queries</h2>
            <p>
              People searching <strong className="text-white">rope bondage workshops near me</strong>,{' '}
              <strong className="text-white">shibari retreat</strong>, or{' '}
              <strong className="text-white">conscious kink</strong> are not always looking for the same
              thing as hotel-based play parties. Multi-day rope conferences emphasize progressive instruction,
              lab time, and partner practice—language that sometimes overlaps wellness and embodiment communities.
              That overlap is why this directory connects Elevation Rope to the broader hub while staying honest
              about the event’s primary pitch: rope education.
            </p>
            <p>
              If you are comparing options, contrast Elevation Rope with general BDSM conventions that only
              offer a few rope classes—here, rope is the spine of the schedule. For Maryland ritual camping, see{' '}
              <Link href={spokePath('maryland-sacred-kink-gatherings')} className="text-primary-400 hover:underline">
                Maryland sacred kink & ritual gatherings
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Geography and the East Coast rope circuit</h2>
            <p>
              The Southeast and Mid-Atlantic host multiple rope-focused events. Western North Carolina provides
              retreat-style immersion—mountain weather, longer drives, and a different lodging footprint than
              downtown hotel takeovers. That changes what you pack and how you plan recovery time between heavy
              lab days. Our listing stays synchronized with the event’s public dates; when in doubt, trust the
              organizer’s calendar.
            </p>
            <p>
              For a regional narrative that ties Maryland camping festivals to this rope conference, read the{' '}
              <Link href={spokePath('east-coast-conscious-kink')} className="text-primary-400 hover:underline">
                East Coast conscious kink overview
              </Link>{' '}
              and return to the{' '}
              <Link href={SPIRITUALITY_KINK_BASE} className="text-primary-400 hover:underline">
                main hub
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Consent-forward rope education</h2>
            <p>
              Good rope education emphasizes negotiation, nerve safety, and injury awareness—not just patterns.
              ECKE does not vet instructors; we point you to the organizer’s roster. If you are newer to
              suspension or heavy floor work, prioritize classes that match your skill level and recovery needs,
              and build in time for hydration and sleep. “Rope brain” is real; plan accordingly.
            </p>
          </section>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">Listing</h2>
          {events.length === 0 ? (
            <p className="text-gray-400">No listing in this cluster.</p>
          ) : (
            <ul className="grid gap-10 list-none p-0 m-0">
              {events.map((event) => (
                <li key={event.slug}>
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
                    itemListName="spirituality_kink_nc_rope"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <SpiritualityKinkRelatedNav current="north-carolina" />

        <section className="mt-12 max-w-3xl">
          <FAQ items={faqItems} title="FAQ — North Carolina rope & embodiment" />
        </section>
      </article>
    </div>
  )
}
