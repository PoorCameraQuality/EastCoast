import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import FAQ from '@/components/FAQ'
import { BASE_URL } from '@/lib/seo'

const DISCORD_INVITE_URL = 'https://discord.gg/xcnGGyGsmT'

export const metadata: Metadata = {
  title: 'About',
  description:
    'East Coast Kink Events connects the BDSM community with event and dungeon listings. Our mission, values, and how to get involved.',
  keywords: 'about, mission, kink community, BDSM events, transparency, safety',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  openGraph: {
    title: 'About',
    description:
      'Learn about East Coast Kink Events: a community-driven hub for transparent listings, education links, and safer discovery.',
    type: 'website',
    url: `${BASE_URL}/about`,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'About East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About',
    description: 'Learn about East Coast Kink Events and our mission.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

const offerLinkClass =
  'inline-flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 mt-4'

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about', current: true },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About East Coast Kink Events',
    description:
      'Learn more about East Coast Kink Events and our mission to connect the BDSM and kink community.',
    publisher: {
      '@type': 'Organization',
      name: 'East Coast Kink Events',
      url: BASE_URL,
    },
  }

  const faqItems = [
    {
      question: 'What is East Coast Kink Events?',
      answer:
        'East Coast Kink Events is an independent, community-driven site for discovering BDSM and kink events, dungeons, vendors, and education—starting from the Northeast and expanding across listings people actually search for. We prioritize clear information and honest context over polished marketing copy.',
    },
    {
      question: 'How do you approach safety?',
      answer:
        'We share detailed listings and practical resources so people can make informed choices. We are not a vetting authority for every host or venue—always use your own judgment, negotiate clearly, and follow the norms and rules of each space you visit.',
    },
    {
      question: 'Can I add my event or dungeon?',
      answer:
        "Yes. Use the contact flow to submit details—we review and add listings when they're a good fit for the directory.",
    },
    {
      question: 'Is the site free to use?',
      answer:
        'Browsing listings and guides is free. Optional supporter tiers help keep the lights on; they are never required to use the calendar or directories.',
    },
    {
      question: 'How can I get involved?',
      answer:
        'Join the Discord for discussion and updates, submit corrections or new listings, and show up to events that match your limits and goals.',
    },
  ]

  return (
    <main className="min-h-screen bg-black section-padding relative overflow-hidden" aria-label="About East Coast Kink Events">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] motion-reduce:opacity-0" aria-hidden>
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary-600 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb items={breadcrumbItems} />

          <p className="mb-2 mt-8 text-sm font-medium uppercase tracking-wide text-primary-400/90">About</p>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            East Coast Kink Events
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-300">
            A calm, information-first hub for people exploring kink on the East Coast (and beyond):{' '}
            <span className="text-white/95">transparent listings</span>,{' '}
            <span className="text-white/95">useful education links</span>, and{' '}
            <span className="text-white/95">room for real community feedback</span>.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold text-white">Why we exist</h2>
          <p className="mt-4 leading-relaxed text-gray-300">
            Adult communities rely on word of mouth and scattered flyers. We consolidate{' '}
            <Link href="/events" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              events
            </Link>
            ,{' '}
            <Link href="/dungeons" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              dungeons
            </Link>
            ,{' '}
            <Link href="/vendors" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              vendors
            </Link>
            , and{' '}
            <Link href="/education" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              longer reads
            </Link>{' '}
            so curious adults can compare options without digging through ten different apps—or guessing what a title
            really means.
          </p>
          <p className="mt-4 leading-relaxed text-gray-400 text-sm sm:text-base">
            Have a listing to add or a correction?{' '}
            <Link href="/contact" className="text-primary-400 underline underline-offset-2">
              Contact us
            </Link>
            . Ground rules for behavior on the site and around submissions live in{' '}
            <Link href="/guidelines" className="text-primary-400 underline underline-offset-2">
              Community guidelines
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <h2 className="font-serif text-2xl font-semibold text-white">What you will find here</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Four pillars—each section of the site has its own depth; this is the short version.
          </p>
          <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
            <li className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <h3 className="font-serif text-lg font-semibold text-white">Events &amp; calendar</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Conferences, parties, workshops, and recurring nights—filtered so you can plan by date, region, and
                vibe.
              </p>
              <Link href="/events" className={offerLinkClass}>
                Browse events <span aria-hidden>→</span>
              </Link>
            </li>
            <li className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <h3 className="font-serif text-lg font-semibold text-white">Dungeon &amp; play-space directory</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Venues and members-only spaces with practical context, not just a name and a dot on a map.
              </p>
              <Link href="/dungeons" className={offerLinkClass}>
                Explore dungeons <span aria-hidden>→</span>
              </Link>
            </li>
            <li className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <h3 className="font-serif text-lg font-semibold text-white">Education &amp; guides</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Articles on consent, safety, and first steps—plus our{' '}
                <Link href="/blog" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
                  blog hubs
                </Link>{' '}
                when you want a reading path tied to real listings.
              </p>
              <Link href="/education" className={offerLinkClass}>
                Open education hub <span aria-hidden>→</span>
              </Link>
            </li>
            <li className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <h3 className="font-serif text-lg font-semibold text-white">Community</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Discord for discussion, heads-ups, and feedback—alongside what we publish on the site.
              </p>
              <a href={DISCORD_INVITE_URL} className={offerLinkClass} rel="noopener noreferrer" target="_blank">
                Join Discord <span aria-hidden>→</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <h2 className="font-serif text-2xl font-semibold text-white">Values</h2>
          <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
            <li className="rounded-xl border border-white/10 px-5 py-6 text-center md:text-left">
              <h3 className="font-serif text-base font-semibold text-primary-300">Transparency</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Straightforward listings and language—fewer surprises, clearer expectations.
              </p>
            </li>
            <li className="rounded-xl border border-white/10 px-5 py-6 text-center md:text-left">
              <h3 className="font-serif text-base font-semibold text-primary-300">Safety-aware</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                We foreground consent-aware resources and honest limits of what any directory can promise.
              </p>
            </li>
            <li className="rounded-xl border border-white/10 px-5 py-6 text-center md:text-left">
              <h3 className="font-serif text-base font-semibold text-primary-300">Inclusion</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Built for a broad adult kink community—respect the person, the party rules, and the venue.
              </p>
            </li>
          </ul>
        </div>

        <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-serif text-2xl font-semibold text-white">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Short answers; follow the links above if you want to go deeper.
          </p>
          <div className="mt-8">
            <FAQ items={faqItems} showTitle={false} />
          </div>
        </section>
      </div>
    </main>
  )
}
