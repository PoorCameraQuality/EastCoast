import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import VendorImage from '@/components/vendors/VendorImage'
import { getSiteSponsorVendor } from '@/data/vendors'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Support This Site',
  description:
    'Keep East Coast Kink Events self-funded and growing. Explore Supporter and Sponsor options for sticky placement and highly visible support.',
  alternates: {
    canonical: `${BASE_URL}/support`,
  },
  openGraph: {
    title: 'Support This Site | East Coast Kink Events',
    description:
      'Help keep East Coast Kink Events self-funded and growing. Supporter and Sponsor tiers available.',
    url: `${BASE_URL}/support`,
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Support East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support This Site | East Coast Kink Events',
    description:
      'Help keep East Coast Kink Events self-funded and growing. Supporter and Sponsor tiers available.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

export default function SupportPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Support', href: '/support', current: true },
  ]
  const sponsorVendor = getSiteSponsorVendor()

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mt-6 mb-10">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Support East Coast Kink Events
            </h1>
            <p className="text-gray-300 leading-relaxed">
              This site is currently self-funded. If it has helped you find events, spaces, education, or community,
              supporting it helps keep everything online and improving.
            </p>
          </header>

          {sponsorVendor ? (
            <section className="mb-8">
              <div className="relative overflow-visible rounded-2xl border border-amber-300/40 bg-black/70 p-5 vendor-sponsor-glitter">
                <span className="sponsor-spotlight-label">
                  Keep this site community funded
                </span>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <VendorImage
                    src={sponsorVendor.logo125Url}
                    alt={`${sponsorVendor.name} logo`}
                    size={125}
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200/90">
                      Sponsor spotlight
                    </p>
                    <h2 className="text-3xl font-serif font-semibold text-white mt-2">
                      <Link href={`/vendors/${sponsorVendor.slug}`} className="underline underline-offset-4 decoration-amber-200/40 hover:decoration-amber-200/80">
                        {sponsorVendor.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-gray-200 mt-2 leading-relaxed">
                      Featured site sponsor. Reach out to Brax if you would like to support the site for a month.
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
                      <Link
                        href={`/vendors/${sponsorVendor.slug}`}
                        className="btn-primary px-3 py-2 text-sm min-h-touch inline-flex items-center justify-center w-full sm:w-auto"
                      >
                        View Sponsor
                      </Link>
                      {sponsorVendor.websiteUrl ? (
                        <a
                          href={sponsorVendor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline px-3 py-2 text-sm min-h-touch inline-flex items-center justify-center w-full sm:w-auto"
                        >
                          Visit Shop
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-2xl font-serif font-semibold text-white mb-2">
                Supporter Tier — $25/month
              </h2>
              <p className="text-gray-300 mb-4">
                Best for events, shops, and community projects. You’ll get <span className="text-white font-semibold">sticky placement</span>{' '}
                so your listing shows up at the top as people browse relevant categories.
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
                <li>Priority visibility while people browse</li>
                <li>Supporter badge</li>
                <li>Helps keep the site running</li>
              </ul>
              <Link
                href="/contact?subject=Supporter%20Tier%20($25%2Fmo)"
                className="btn-primary inline-flex items-center justify-center w-full min-h-touch py-2.5 text-sm"
              >
                Request Supporter Tier
              </Link>
              <p className="text-xs text-gray-400 mt-3">
                Prefer Discord? Message <span className="text-gray-200 font-semibold">Brax117</span>.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-2xl font-serif font-semibold text-white mb-2">
                Sponsor the Website
              </h2>
              <p className="text-gray-300 mb-4">
                Sponsorship includes the Supporter tier plus something <span className="text-white font-semibold">highly visible</span>{' '}
                and custom to your brand or community project.
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
                <li>Includes Supporter Tier benefits</li>
                <li>Special placement / feature (details via Discord)</li>
                <li>Directly funds improvements and hosting</li>
              </ul>
              <div className="space-y-3">
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center justify-center w-full min-h-touch py-2.5 text-sm"
                  aria-label="Open Discord (opens in a new tab)"
                >
                  Open Discord
                </a>
                <Link
                  href="/contact?subject=Website%20Sponsorship%20(Discord%20Brax117)"
                  className="btn-secondary inline-flex items-center justify-center w-full min-h-touch py-2.5 text-sm"
                >
                  Contact for Sponsorship
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Discord handle: <span className="text-gray-200 font-semibold">Brax117</span>
              </p>
            </section>
          </div>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-xl font-serif font-semibold text-white mb-2">Where your support goes</h2>
            <p className="text-gray-300 leading-relaxed">
              Hosting, maintenance, indexing/SEO, and feature improvements. Support also helps keep listings easy to browse and up to date.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

