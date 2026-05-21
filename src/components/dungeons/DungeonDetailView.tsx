import Link from 'next/link'
import { DungeonStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import DungeonImage from '@/components/dungeons/DungeonImage'
import { DancecardProductPitch } from '@/components/dancecard/DancecardProductPitch'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import MarkdownSimple from '@/components/MarkdownSimple'
import VenueDetailAside from '@/components/venues/VenueDetailAside'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

type Dungeon = {
  name: string
  slug: string
  location: { city: string; state: string; address?: string }
  category?: string
  excerpt?: string
  description?: { long?: string }
  logo?: string
  contact?: { phone?: string; email?: string }
  hours?: string
  socialMedia?: Record<string, string | undefined>
  website?: string
  shopUrl?: string
  vendorListingSlug?: string
}

export default function DungeonDetailView({ dungeon }: { dungeon: Dungeon }) {
  const stateSlug = stateAbbrToSlug(dungeon.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : dungeon.location.state
  const longBody = dungeon.description?.long || dungeon.excerpt || ''
  const hasLongBody = longBody.length > 180

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons' },
    { label: dungeon.name, href: `/dungeons/${dungeon.slug}`, current: true },
  ]

  return (
    <DiscoveryPageShell accent="violet">
      <DungeonStructuredData dungeon={dungeon} />

      <section className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mt-2 max-w-3xl">
            <Link
              href="/dungeons"
              className="mb-4 inline-flex min-h-touch items-center text-sm text-gray-400 transition hover:text-primary-300"
            >
              ← Dungeons &amp; clubs
            </Link>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <DungeonImage
                src={dungeon.logo}
                alt={`${dungeon.name} — BDSM dungeon in ${dungeon.location.city}, ${dungeon.location.state}`}
                size={96}
                className="mx-auto shrink-0 rounded-2xl border border-white/10 bg-black/40 p-2 shadow-lg sm:mx-0"
              />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                {dungeon.category ? (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400/80">
                    {dungeon.category}
                  </p>
                ) : null}
                <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {dungeon.name}
                </h1>
                <p className="mt-2 text-base text-gray-300">
                  {dungeon.location.city}, {dungeon.location.state}
                </p>
                {dungeon.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400 sm:line-clamp-2">
                    {dungeon.excerpt}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {stateSlug ? (
                <Link
                  href={`/states/${stateSlug}`}
                  className="discovery-filter-pill justify-center sm:justify-start"
                >
                  {stateName} hub
                </Link>
              ) : null}
              {stateSlug ? (
                <Link
                  href={`/bdsm-events/${stateSlug}`}
                  className="discovery-filter-pill justify-center sm:justify-start"
                >
                  Events in {dungeon.location.state}
                </Link>
              ) : null}
              <Link href="/events" className="discovery-filter-pill justify-center sm:justify-start">
                All events
              </Link>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:gap-8">
            <article className="card-glass p-4 sm:p-6">
              <div className="card-glass-wash" aria-hidden />
              <div className="relative z-10">
                <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">About this space</h2>
                {hasLongBody ? (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400 lg:hidden">
                      {dungeon.excerpt || longBody.slice(0, 200)}
                      {(dungeon.excerpt || longBody).length > 200 ? '…' : ''}
                    </p>
                    <details className="group mt-4 lg:hidden">
                      <summary className="flex min-h-touch cursor-pointer list-none items-center text-sm font-medium text-primary-400 hover:text-primary-300 [&::-webkit-details-marker]:hidden">
                        <span className="mr-2 transition group-open:rotate-90" aria-hidden>
                          ▶
                        </span>
                        Full listing notes
                      </summary>
                      <div className="mt-4">
                        <MarkdownSimple content={longBody} />
                      </div>
                    </details>
                    <div className="mt-4 hidden lg:block">
                      <MarkdownSimple content={longBody} />
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-gray-300">Details coming soon—check the venue website when available.</p>
                )}
                <p className="mt-6 text-xs text-gray-500">
                  Directory listing for discovery—not an endorsement. Confirm hours, vetting, and house rules with
                  the venue before you visit.
                </p>
              </div>
            </article>

            <VenueDetailAside
              name={dungeon.name}
              slug={dungeon.slug}
              entityType="dungeon"
              location={dungeon.location}
              contact={dungeon.contact}
              hours={dungeon.hours}
              socialMedia={dungeon.socialMedia}
              website={dungeon.website}
              shopUrl={dungeon.shopUrl}
              vendorListingSlug={dungeon.vendorListingSlug}
            />
          </div>

          <details className="group mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <summary className="flex min-h-touch cursor-pointer list-none items-center font-medium text-gray-300 hover:text-white [&::-webkit-details-marker]:hidden">
              <span className="mr-2 text-primary-400 transition group-open:rotate-90" aria-hidden>
                ▶
              </span>
              More links in {dungeon.location.city} area
            </summary>
            <div className="mt-4 space-y-4">
              <ListingHubLinks
                variant="dungeon"
                stateAbbr={dungeon.location.state}
                city={dungeon.location.city}
              />
              <DiscoveryEngineStrip stateAbbr={dungeon.location.state} />
            </div>
          </details>
        </div>
      </section>

      <div className="container-custom pb-12">
        <DancecardProductPitch organizerLean className="mb-10" />
        <RelatedContent currentDungeon={dungeon} />
      </div>
    </DiscoveryPageShell>
  )
}
