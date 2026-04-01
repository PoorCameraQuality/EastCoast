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
import { SPIRITUALITY_KINK_BASE, spokePath } from '@/lib/spiritualityKinkProgrammatic'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

const PATH = `${SPIRITUALITY_KINK_BASE}/east-coast-conscious-kink`

function isSpotlightSlug(s: string): s is CuratedSpotlightSlug {
  return (CURATED_SPOTLIGHT_EVENT_SLUGS as readonly string[]).includes(s)
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'East Coast conscious kink & sacred sexuality — regional overview'
  const description =
    'How Primal Arts Festival, THE Beltane, and Elevation Rope fit East Coast searches for conscious kink retreats, sacred sexuality, and rope—plus BDSM “primal play” disambiguation.'
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

export default async function EastCoastConsciousKinkPage() {
  const events = await getCuratedSpotlightEvents()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Spirituality & kink', href: SPIRITUALITY_KINK_BASE },
    { label: 'East Coast conscious kink', href: PATH, current: true },
  ]

  const faqItems = [
    {
      question: 'What does “primal play” mean here (BDSM) vs other uses of “primal”?',
      answer:
        'In kink communities, “primal” often refers to primal dynamics or primal play as a style of scene and negotiation—unrelated to “Primal Play” fitness branding or trading-card games. Primal Arts Festival is a named festival; read its listing for what is actually offered. If you search, use “primal play BDSM” or “primal kink” to avoid irrelevant results.',
    },
    {
      question: 'Is this a complete list of East Coast events?',
      answer:
        'No. This cluster highlights three anchors for editorial SEO. The full calendar is at /events and /states.',
    },
    {
      question: 'Can I cite this page for academic or media work?',
      answer:
        'You may quote with attribution to East Coast Kink Events; verify dates and policies with organizers before publishing.',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <SpiritualityKinkItemListStructuredData
        path={PATH}
        name="East Coast conscious kink and sacred sexuality — regional overview"
        description="Primal Arts Festival, THE Beltane, Elevation Rope — regional ItemList."
        events={events}
      />
      <article className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            East Coast conscious kink & sacred sexuality — regional overview
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            <strong className="text-white">Short answer:</strong> The East Coast corridor mixes dense urban
            scenes with retreat land and mountain venues. Three recurring events anchor this subsection: two
            Maryland campground-adjacent festivals (Primal Arts and THE Beltane) and one North Carolina rope
            intensive (Elevation Rope).
          </p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 mb-12">
          <section>
            <h2 className="font-serif text-2xl text-white">What Is a “Conscious Kink Retreat” in Search Terms?</h2>
            <p>
              People use <strong className="text-white">conscious kink retreat</strong>,{' '}
              <strong className="text-white">sacred sexuality workshop</strong>, and{' '}
              <strong className="text-white">somatic kink</strong> when they want more than a single-night
              party—they want schedule depth, community container, and time to learn. The East Coast offers both
              hotel conventions and land-based camping; this cluster pairs two Maryland gatherings known for
              ritual-forward and sacred-sexuality language with a North Carolina rope conference that serves a
              different but overlapping audience.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Why “Primal” Needs a BDSM Modifier Online</h2>
            <p>
              The word <em>primal</em> is overloaded. For kink search, pair{' '}
              <strong className="text-white">primal play BDSM</strong>, <strong className="text-white">primal kink</strong>, or{' '}
              <strong className="text-white">primal play kink</strong> to avoid fitness and gaming noise. Primal
              Arts Festival uses “primal” in the festival name and describes sacred sexuality and fire ritual in
              public copy—always confirm the current year’s program on the official site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Regional links: Maryland vs North Carolina</h2>
            <p>
              Maryland listings focus on large private campgrounds and seasonal ritual framing—see{' '}
              <Link href={spokePath('maryland-sacred-kink-gatherings')} className="text-primary-400 hover:underline">
                Maryland sacred kink & ritual gatherings
              </Link>
              . North Carolina focuses on rope education and mountain retreat logistics—see{' '}
              <Link href={spokePath('north-carolina-rope-embodiment')} className="text-primary-400 hover:underline">
                North Carolina rope & embodiment
              </Link>
              . Together they cover the same three ECKE slugs as the{' '}
              <Link href={SPIRITUALITY_KINK_BASE} className="text-primary-400 hover:underline">
                main hub
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">FetLife, Google, and directory ethics</h2>
            <p>
              Search engines cannot rely on walled-garden event graphs. Independent directories can add
              transparency—if they avoid thin duplication. These pages are written with distinct angles, link to
              each other, and embed real listings below. We do not claim sponsorship or endorsement from
              producers; we cite public information and link out for registration.
            </p>
          </section>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">All three anchor listings</h2>
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
                    itemListName="spirituality_kink_east_coast"
                  />
                </li>
              )
            })}
          </ul>
        </section>

        <SpiritualityKinkRelatedNav current="east-coast" />

        <section className="mt-12 max-w-3xl">
          <FAQ items={faqItems} title="FAQ — East Coast conscious kink" />
        </section>
      </article>
    </div>
  )
}
