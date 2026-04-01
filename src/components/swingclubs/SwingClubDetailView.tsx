import Link from 'next/link'
import { SwingClubStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import DungeonImage from '@/components/dungeons/DungeonImage'

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
  /** When known—many clubs publish little online; confirm before visiting */
  hours?: string
  /** e.g. "BYOB (mixers provided)" or "Cash bar" */
  byob?: string
  /** e.g. "Members + guests", "RSVP required" */
  membership?: string
  /** ISO date YYYY-MM-DD — when a human last checked this listing */
  lastReviewed?: string
  /** Short bullets with explicit provenance (`source` from data files is typed as string in JS) */
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
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons & clubs', href: '/dungeons' },
    { label: club.name, href: `/swing-clubs/${club.slug}`, current: true },
  ]

  return (
    <div className="min-h-screen bg-black">
      <SwingClubStructuredData club={club} />

      <section className="section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <DiscoveryEngineStrip stateAbbr={club.location?.state} />

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dungeons"
              className="btn-outline inline-flex min-h-touch items-center justify-center px-4 py-2 text-sm w-full sm:w-auto"
            >
              ← Dungeons &amp; clubs
            </Link>
            <Link
              href="/dungeons#swing-clubs"
              className="btn-outline inline-flex min-h-touch items-center justify-center px-4 py-2 text-sm w-full sm:w-auto"
            >
              All swing clubs
            </Link>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <DungeonImage
              src={club.logo}
              alt={`${club.name} — swing & lifestyle club in ${club.location.city}, ${club.location.state}`}
              size={96}
              className="flex-shrink-0"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-white">
                {club.name}
              </h1>
              <p className="text-gray-400 mt-2">
                {club.location.city}, {club.location.state}
              </p>
              {club.category ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-wide text-violet-200/90">
                  {club.category}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-950/25 p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-violet-100/90">
              <span className="font-semibold text-violet-200">Reality check:</span> lots of lifestyle venues keep
              websites minimal (or dated)—hours, pricing, and door policy often live in members-only areas, email
              blasts, or social posts. This page summarizes what we could verify from public sources and our research;
              it is <span className="italic">not</span> a substitute for the club&apos;s own rules. When in doubt, use
              their official site and phone number below.
            </p>
            {club.lastReviewed ? (
              <p className="mt-3 text-xs text-violet-300/80">
                Listing last reviewed:{' '}
                <time dateTime={club.lastReviewed}>{formatReviewedDate(club.lastReviewed)}</time>
              </p>
            ) : null}
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            <article className="card-elegant p-4 sm:p-6">
              <h2 className="text-2xl font-serif font-semibold text-white">About this club</h2>

              {club.facts && club.facts.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white">Quick facts</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Each line is tagged by where we got it—still confirm on the venue before you travel.
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    {club.facts.map((fact, i) => (
                      <li
                        key={`${fact.text}-${i}`}
                        className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-sm text-gray-300 leading-relaxed flex-1">{fact.text}</span>
                        <span
                          className="shrink-0 self-start rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                          title="Source of this fact"
                        >
                          {factSourceLabel(fact.source)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p
                className={`text-gray-300 whitespace-pre-line leading-relaxed ${
                  club.facts && club.facts.length > 0 ? 'mt-8' : 'mt-4'
                }`}
              >
                {club.description?.long || club.excerpt || 'We do not have a written summary yet—use the official links in the sidebar when available.'}
              </p>
            </article>

            <aside className="card-elegant p-4 sm:p-6 space-y-4">
              {club.hours || club.byob || club.membership ? (
                <div className="space-y-3 border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold text-white">Practical details</h3>
                  <p className="text-xs text-gray-500">From public listings—confirm before you go.</p>
                  {club.hours ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hours / schedule</p>
                      <p className="text-sm text-gray-300 mt-1 whitespace-pre-line">{club.hours}</p>
                    </div>
                  ) : null}
                  {club.byob ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Drinks</p>
                      <p className="text-sm text-gray-300 mt-1">{club.byob}</p>
                    </div>
                  ) : null}
                  {club.membership ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Membership / entry</p>
                      <p className="text-sm text-gray-300 mt-1 whitespace-pre-line">{club.membership}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div>
                <h3 className="text-lg font-semibold text-white">Location</h3>
                <p className="text-sm text-gray-300">
                  {club.location.city}, {club.location.state}
                </p>
                {club.location.address ? (
                  <p className="text-xs text-gray-500 mt-1">{club.location.address}</p>
                ) : null}
              </div>

              {club.contact?.phone || club.contact?.email ? (
                <div>
                  <h3 className="text-lg font-semibold text-white">Contact</h3>
                  {club.contact?.phone ? (
                    <a
                      href={`tel:${club.contact.phone.replace(/\D/g, '')}`}
                      className="inline-flex min-h-touch items-center text-sm text-gray-300 hover:text-white transition-colors"
                      aria-label={`Call ${club.name}`}
                    >
                      {club.contact.phone}
                    </a>
                  ) : null}
                  {club.contact?.email ? (
                    <a
                      href={`mailto:${club.contact.email}`}
                      className="inline-flex min-h-touch items-center text-sm text-gray-300 hover:text-white transition-colors mt-1 break-all"
                      aria-label={`Email ${club.name}`}
                    >
                      {club.contact.email}
                    </a>
                  ) : null}
                </div>
              ) : null}

              {club.socialMedia && Object.keys(club.socialMedia).length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-white">Follow</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {club.socialMedia.facebook ? (
                      <a
                        href={club.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Facebook
                      </a>
                    ) : null}
                    {club.socialMedia.instagram ? (
                      <a
                        href={club.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Instagram
                      </a>
                    ) : null}
                    {club.socialMedia.twitter ? (
                      <a
                        href={club.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Twitter
                      </a>
                    ) : null}
                    {club.socialMedia.fetlife ? (
                      <a
                        href={club.socialMedia.fetlife}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        FetLife
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {club.website ? (
                <a
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex min-h-touch items-center justify-center px-4 py-2 text-sm w-full"
                  aria-label={`Visit ${club.name} website (opens in a new tab)`}
                >
                  Visit Website
                </a>
              ) : null}

              <Link
                href="/contact"
                className="btn-outline inline-flex min-h-touch items-center justify-center px-4 py-2 text-sm w-full"
              >
                Contact Us
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <div className="container-custom pb-12">
        <RelatedContent currentSwingClub={club} />
      </div>
    </div>
  )
}
