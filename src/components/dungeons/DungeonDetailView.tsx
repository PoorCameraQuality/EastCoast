import Link from 'next/link'
import { DungeonStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import DungeonImage from '@/components/dungeons/DungeonImage'

/** Converts schema.org openingHours (e.g. "Fr 20:00-02:00, Sa 20:00-02:00") to human-readable format. */
function formatHours(hours: string): string {
  const dayMap: Record<string, string> = {
    Mo: 'Monday',
    Tu: 'Tuesday',
    We: 'Wednesday',
    Th: 'Thursday',
    Fr: 'Friday',
    Sa: 'Saturday',
    Su: 'Sunday',
  }
  const parts = hours.split(',').map((s) => s.trim())
  return parts
    .map((part) => {
      const match = part.match(/^([A-Za-z]{2})\s+(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
      if (!match) return part
      const [, day, startH, startM, endH, endM] = match
      const dayName = dayMap[day as keyof typeof dayMap] || day
      const fmt = (h: string, m: string) => {
        const hour = parseInt(h, 10)
        const mins = `:${m}`
        if (hour === 0) return `12${mins} am`
        if (hour === 12) return `12${mins} pm`
        return hour > 12 ? `${hour - 12}${mins} pm` : `${hour}${mins} am`
      }
      return `${dayName} ${fmt(startH, startM)} – ${fmt(endH, endM)}`
    })
    .join('\n')
}

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
}

export default function DungeonDetailView({ dungeon }: { dungeon: Dungeon }) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons' },
    { label: dungeon.name, href: `/dungeons/${dungeon.slug}`, current: true },
  ]

  return (
    <div className="min-h-screen bg-black">
      <DungeonStructuredData dungeon={dungeon} />

      <section className="section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <ListingHubLinks
            variant="dungeon"
            stateAbbr={dungeon.location.state}
            city={dungeon.location.city}
          />
          <DiscoveryEngineStrip stateAbbr={dungeon.location?.state} />

          <div className="mt-4">
            <Link
              href="/dungeons"
              className="btn-outline inline-flex min-h-touch items-center justify-center px-4 py-2 text-sm w-full sm:w-auto"
            >
              Back to Dungeons
            </Link>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <DungeonImage
              src={dungeon.logo}
              alt={`${dungeon.name} — BDSM dungeon in ${dungeon.location.city}, ${dungeon.location.state}`}
              size={96}
              className="flex-shrink-0"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-white">
                {dungeon.name}
              </h1>
              <p className="text-gray-400 mt-2">
                {dungeon.location.city}, {dungeon.location.state}
              </p>
              {dungeon.category ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
                  {dungeon.category}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            <article className="card-elegant p-4 sm:p-6">
              <h2 className="text-2xl font-serif font-semibold text-white">About this space</h2>
              <p className="text-gray-300 mt-4 whitespace-pre-line leading-relaxed">
                {dungeon.description?.long || dungeon.excerpt || 'Details coming soon.'}
              </p>
            </article>

            <aside className="card-elegant p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Location</h3>
                <p className="text-sm text-gray-300">
                  {dungeon.location.city}, {dungeon.location.state}
                </p>
                {dungeon.location.address ? (
                  <p className="text-xs text-gray-500 mt-1">{dungeon.location.address}</p>
                ) : null}
              </div>

              {dungeon.contact?.phone || dungeon.contact?.email ? (
                <div>
                  <h3 className="text-lg font-semibold text-white">Contact</h3>
                  {dungeon.contact?.phone ? (
                    <a
                      href={`tel:${dungeon.contact.phone.replace(/\D/g, '')}`}
                      className="inline-flex min-h-touch items-center text-sm text-gray-300 hover:text-white transition-colors"
                      aria-label={`Call ${dungeon.name}`}
                    >
                      {dungeon.contact.phone}
                    </a>
                  ) : null}
                  {dungeon.contact?.email ? (
                    <a
                      href={`mailto:${dungeon.contact.email}`}
                      className="inline-flex min-h-touch items-center text-sm text-gray-300 hover:text-white transition-colors mt-1 break-all"
                      aria-label={`Email ${dungeon.name}`}
                    >
                      {dungeon.contact.email}
                    </a>
                  ) : null}
                </div>
              ) : null}

              {dungeon.hours ? (
                <div>
                  <h3 className="text-lg font-semibold text-white">Hours</h3>
                  <p className="text-sm text-gray-300 whitespace-pre-line">{formatHours(dungeon.hours)}</p>
                </div>
              ) : null}

              {dungeon.socialMedia && Object.keys(dungeon.socialMedia).length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-white">Follow</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dungeon.socialMedia.fetlife ? (
                      <a
                        href={dungeon.socialMedia.fetlife}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                        aria-label={`${dungeon.name} on FetLife`}
                      >
                        FetLife
                      </a>
                    ) : null}
                    {dungeon.socialMedia.facebook ? (
                      <a
                        href={dungeon.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                        aria-label={`${dungeon.name} on Facebook`}
                      >
                        Facebook
                      </a>
                    ) : null}
                    {dungeon.socialMedia.instagram ? (
                      <a
                        href={dungeon.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                        aria-label={`${dungeon.name} on Instagram`}
                      >
                        Instagram
                      </a>
                    ) : null}
                    {dungeon.socialMedia.twitter ? (
                      <a
                        href={dungeon.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                        aria-label={`${dungeon.name} on Twitter`}
                      >
                        Twitter
                      </a>
                    ) : null}
                    {dungeon.socialMedia.youtube ? (
                      <a
                        href={dungeon.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-touch items-center px-2 text-sm text-gray-300 hover:text-white transition-colors"
                        aria-label={`${dungeon.name} on YouTube`}
                      >
                        YouTube
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {dungeon.website ? (
                <a
                  href={dungeon.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex min-h-touch items-center justify-center px-4 py-2 text-sm w-full"
                  aria-label={`Visit ${dungeon.name} website (opens in a new tab)`}
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
        <RelatedContent currentDungeon={dungeon} />
      </div>
    </div>
  )
}
