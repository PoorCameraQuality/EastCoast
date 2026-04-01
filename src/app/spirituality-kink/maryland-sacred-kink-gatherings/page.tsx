import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import EventCard from '@/components/EventCard'
import FAQ from '@/components/FAQ'
import SpiritualityKinkItemListStructuredData from '@/components/spirituality-kink/SpiritualityKinkItemListStructuredData'
import SpiritualityKinkRelatedNav from '@/components/spirituality-kink/SpiritualityKinkRelatedNav'
import { getCuratedSpotlightEvents } from '@/lib/curatedSpotlightEvents'
import { filterFeaturedEvents, MARYLAND_FEATURE_SLUGS, SPIRITUALITY_KINK_BASE, spokePath } from '@/lib/spiritualityKinkProgrammatic'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

const PATH = `${SPIRITUALITY_KINK_BASE}/maryland-sacred-kink-gatherings`

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Maryland sacred kink & ritual gatherings — Primal Arts & THE Beltane'
  const description =
    'Conscious kink and seasonal ritual camping in Maryland: Primal Arts Festival and THE Beltane (Darlington area) with dates, venues, and ECKE listings.'
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

export default async function MarylandSacredKinkPage() {
  const all = await getCuratedSpotlightEvents()
  const events = filterFeaturedEvents(all, MARYLAND_FEATURE_SLUGS)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Spirituality & kink', href: SPIRITUALITY_KINK_BASE },
    { label: 'Maryland sacred kink', href: PATH, current: true },
  ]

  const faqItems = [
    {
      question: 'Are Primal Arts Festival and THE Beltane the same producer?',
      answer:
        'Different teams and brands. What they share is geography and a campground-adjacent culture: outdoor ritual space, seasonal timing, and sex-positive kink-forward programming. Compare official sites for tickets, policies, and accessibility.',
    },
    {
      question: 'Is this “religious” content?',
      answer:
        'Some attendees describe pagan, seasonal, or ritual language; others attend for social and play-forward reasons. ECKE summarizes public organizer copy; we do not prescribe belief or practice.',
    },
    {
      question: 'Where should I stay for Maryland kink camping?',
      answer:
        'Each listing includes venue notes—cabins, tents, or registration-mediated details. Book only through official channels and confirm driving directions with the organizer.',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <SpiritualityKinkItemListStructuredData
        path={PATH}
        name="Maryland sacred kink and ritual gatherings"
        description="Primal Arts Festival and THE Beltane — Maryland Darlington-area listings."
        events={events}
      />
      <article className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Maryland sacred kink & ritual gatherings
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            <strong className="text-white">Short answer:</strong> Two recurring Maryland campground-adjacent
            gatherings—Primal Arts Festival and THE Beltane—often surface when people search for sacred sexuality,
            Beltane ritual energy, or large-scale kink camping in the Mid-Atlantic.
          </p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 mb-12">
          <section>
            <h2 className="font-serif text-2xl text-white">What “sacred kink” looks like on the ground in Maryland</h2>
            <p>
              Searchers typing <strong className="text-white">sacred kink events</strong>,{' '}
              <strong className="text-white">spiritual BDSM retreat</strong>, or{' '}
              <strong className="text-white">conscious sexuality festival</strong> are often trying to
              distinguish weekend hotel parties from multi-day outdoor immersion. The Darlington, Maryland
              corridor has become a recognizable hub for large private campgrounds that host clothing-optional or
              sex-positive programming with ritual space, fire circles, and dungeon infrastructure—often
              described in marketing as sacred, primal, or seasonal.
            </p>
            <p>
              Primal Arts Festival foregrounds sacred sexuality, fire, ordeal-adjacent art, and primal expression
              in its public copy. THE Beltane explicitly names seasonal ritual, bonfire culture, and a very large
              on-site dungeon alongside classes on intimacy and kink. Neither is a substitute for the other: read
              each ECKE listing and the official organizer site for the year you plan to attend.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Why Maryland keeps showing up in regional search</h2>
            <p>
              The Mid-Atlantic is dense with kink community and within driving distance for much of the East Coast.
              When a property can host hundreds of attendees with cabins, meals, and outdoor play space, the same
              location can support different brands across the calendar. That is good for comparison shopping and
              bad for thin affiliate pages—so we keep this page anchored to two named events with real slugs and
              dates in our database, not a generic “kink in Maryland” template.
            </p>
            <p>
              If you also need rope-focused education, see the{' '}
              <Link href={spokePath('north-carolina-rope-embodiment')} className="text-primary-400 hover:underline">
                North Carolina rope & embodiment
              </Link>{' '}
              page for Elevation Rope, or the{' '}
              <Link href={spokePath('east-coast-conscious-kink')} className="text-primary-400 hover:underline">
                East Coast conscious kink overview
              </Link>{' '}
              for how three anchor listings fit together regionally.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Safety, consent, and logistics</h2>
            <p>
              Outdoor events add weather, terrain, and camping logistics. Indoor hotel takeovers add different
              tradeoffs. ECKE lists neutral facts—dates, state, and excerpt—while organizers publish the full
              consent framework, photography rules, and medical support. If you are new to large-scale kink
              camping, budget time for orientation, pack for temperature swings, and keep emergency contacts
              offline-accessible.
            </p>
          </section>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">Listings</h2>
          {events.length === 0 ? (
            <p className="text-gray-400">No Maryland listings in this cluster.</p>
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
                    itemListName="spirituality_kink_maryland"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <SpiritualityKinkRelatedNav current="maryland" />

        <section className="mt-12 max-w-3xl">
          <FAQ items={faqItems} title="FAQ — Maryland sacred kink" />
        </section>
      </article>
    </div>
  )
}
