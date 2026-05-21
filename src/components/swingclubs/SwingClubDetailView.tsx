import Link from 'next/link'
import { SwingClubStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import DungeonImage from '@/components/dungeons/DungeonImage'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import MarkdownSimple from '@/components/MarkdownSimple'
import VenueDetailAside from '@/components/venues/VenueDetailAside'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

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

export default function SwingClubDetailView({ club }: { club: Club }) {
  const stateSlug = stateAbbrToSlug(club.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : club.location.state
  const longBody = club.description?.long || club.excerpt || ''
  const hasLongBody = longBody.length > 180

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons & clubs', href: '/dungeons' },
    { label: club.name, href: `/swing-clubs/${club.slug}`, current: true },
  ]

  const practicalAside =
    club.hours || club.byob || club.membership ? (
      <div className="space-y-3 border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-white">Practical details</h3>
        <p className="text-xs text-gray-500">From public sources—confirm before you go.</p>
        {club.hours ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hours</p>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-300">{club.hours}</p>
          </div>
        ) : null}
        {club.byob ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Drinks</p>
            <p className="mt-1 text-sm text-gray-300">{club.byob}</p>
          </div>
        ) : null}
        {club.membership ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entry</p>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-300">{club.membership}</p>
          </div>
        ) : null}
      </div>
    ) : null

  return (
    <DiscoveryPageShell accent="violet">
      <SwingClubStructuredData club={club} />

      <section className="section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <header className="mt-2 max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Link
                href="/dungeons"
                className="inline-flex min-h-touch items-center text-sm text-gray-400 transition hover:text-violet-300"
              >
                ← Dungeons &amp; clubs
              </Link>
              <Link
                href="/dungeons#swing-clubs"
                className="inline-flex min-h-touch items-center text-sm text-gray-400 transition hover:text-violet-300"
              >
                Swing listings
              </Link>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <DungeonImage
                src={club.logo}
                alt={`${club.name} — swing & lifestyle club in ${club.location.city}, ${club.location.state}`}
                size={96}
                className="mx-auto shrink-0 rounded-2xl border border-violet-500/20 bg-black/40 p-2 shadow-lg sm:mx-0"
              />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                {club.category ? (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                    {club.category}
                  </p>
                ) : null}
                <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">{club.name}</h1>
                <p className="mt-2 text-base text-gray-300">
                  {club.location.city}, {club.location.state}
                </p>
                {club.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400 sm:line-clamp-2">
                    {club.excerpt}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {stateSlug ? (
                <Link
                  href={`/states/${stateSlug}`}
                  className="discovery-filter-pill justify-center border-violet-500/30 sm:justify-start"
                >
                  {stateName} hub
                </Link>
              ) : null}
              {stateSlug ? (
                <Link
                  href={`/bdsm-events/${stateSlug}`}
                  className="discovery-filter-pill justify-center sm:justify-start"
                >
                  Events in {club.location.state}
                </Link>
              ) : null}
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:gap-8">
            <article className="card-glass p-4 sm:p-6">
              <div className="card-glass-wash card-glass-wash-violet opacity-60" aria-hidden />
              <div className="relative z-10">
                <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">About this club</h2>

                {club.facts && club.facts.length > 0 ? (
                  <ul className="mt-4 space-y-3 list-none pl-0">
                    {club.facts.map((fact, i) => (
                      <li
                        key={`${fact.text}-${i}`}
                        className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                      >
                        <p className="text-sm leading-relaxed text-gray-300">{fact.text}</p>
                        <span className="mt-2 inline-block rounded border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          {factSourceLabel(fact.source)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {hasLongBody ? (
                  <div className={club.facts?.length ? 'mt-6' : 'mt-4'}>
                    <MarkdownSimple content={longBody} />
                  </div>
                ) : (
                  <p className="mt-4 text-gray-300">
                    We do not have a written summary yet—use official links in the sidebar when available.
                  </p>
                )}

                <details className="group mt-6 rounded-lg border border-violet-500/20 bg-violet-950/20 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-violet-200/90 hover:text-violet-100 [&::-webkit-details-marker]:hidden">
                    Before you visit
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-violet-100/80">
                    Many lifestyle venues keep policies in members-only areas or social posts. This page summarizes
                    public sources—it is not a substitute for the club&apos;s own rules.
                    {club.lastReviewed ? (
                      <>
                        {' '}
                        Last reviewed{' '}
                        <time dateTime={club.lastReviewed}>{formatReviewedDate(club.lastReviewed)}</time>.
                      </>
                    ) : null}
                  </p>
                </details>
              </div>
            </article>

            <VenueDetailAside
              name={club.name}
              slug={club.slug}
              entityType="swingClub"
              location={club.location}
              contact={club.contact}
              hours={undefined}
              socialMedia={club.socialMedia}
              website={club.website}
            >
              {practicalAside}
            </VenueDetailAside>
          </div>

          <details className="group mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <summary className="flex min-h-touch cursor-pointer list-none items-center font-medium text-gray-300 hover:text-white [&::-webkit-details-marker]:hidden">
              <span className="mr-2 text-violet-400 transition group-open:rotate-90" aria-hidden>
                ▶
              </span>
              More links in {club.location.city} area
            </summary>
            <div className="mt-4 space-y-4">
              <ListingHubLinks variant="swing" stateAbbr={club.location.state} city={club.location.city} />
              <DiscoveryEngineStrip stateAbbr={club.location.state} />
            </div>
          </details>
        </div>
      </section>

      <div className="container-custom pb-12">
        <RelatedContent currentSwingClub={club} />
      </div>
    </DiscoveryPageShell>
  )
}
