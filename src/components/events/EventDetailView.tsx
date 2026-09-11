import Image from 'next/image'
import Link from 'next/link'
import { EventStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import EventBrandMasthead from '@/components/events/EventBrandMasthead'
import EventActionDock from '@/components/events/EventActionDock'
import EventMobileActionBar from '@/components/events/EventMobileActionBar'
import EventWhyGoSection from '@/components/events/EventWhyGoSection'
import EventOverviewModules from '@/components/events/EventOverviewModules'
import EventFeatureTiles from '@/components/events/EventFeatureTiles'
import EventVenueTravel from '@/components/events/EventVenueTravel'
import EventListingStatus from '@/components/events/EventListingStatus'
import OrgOrganizerBar from '@/components/org/OrgOrganizerBar'
import { openEventApplications } from '@/lib/eckeOrgEventAssets'
import KinkSocialEntityGallerySection from '@/components/kink-social/KinkSocialEntityGallerySection'
import EntityPageViewTracker from '@/components/analytics/EntityPageViewTracker'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import type { EventPageRecord } from '@/lib/unifiedEvents'
import { parseEventDescription } from '@/lib/eventPageContent'
import { listingCopyToSafeHtml, orgCopyLooksLikeHtml } from '@/lib/eckeOrgRichText'
import { ECKE_DISCORD_INVITE_URL, ECKE_DISCORD_LABEL } from '@/lib/eckeCommunity'
import type { EventMedia } from '@/lib/eventMedia'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { eventBrandStyle } from '@/lib/eventBrandTheme'
import { listingImageUnoptimized } from '@/lib/nextImageSrc'

type EventUpdate = {
  id: string
  title: string
  body: string
  image_url?: string | null
  published_at?: string | null
  created_at?: string
}

type Props = {
  event: EventPageRecord
  media: EventMedia
  brand: EventBrandTheme
  canManage?: boolean
  posts?: EventUpdate[]
}

export default function EventDetailView({ event, media, brand, canManage, posts = [] }: Props) {
  const stateSlug = stateAbbrToSlug(event.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : event.location.state
  const hasFeatures = Boolean(event.features?.length)
  const hasLongCopy = Boolean(event.longDescription?.trim())
  const parsed = hasLongCopy ? parseEventDescription(event.longDescription!) : { intro: '', sections: [] }
  const applications = openEventApplications(event)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: event.name, href: `/events/${event.slug}`, current: true },
  ]

  return (
    <div className="event-detail-page discovery-page" style={eventBrandStyle(brand)}>
      <EntityPageViewTracker
        entityType="event"
        slug={event.slug}
        name={event.name}
        organizerName={event.organizer}
        pagePath={`/events/${event.slug}`}
      />
      <EventStructuredData event={event} />

      <section className="section-padding pt-4 md:pt-6 event-detail-main">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <Link
            href="/events"
            className="mb-4 mt-2 inline-flex min-h-touch items-center text-sm text-sf-muted transition hover:text-sf-strong"
          >
            ← All events
          </Link>

          {canManage ? <OrgOrganizerBar slug={event.slug} /> : null}

          {event.status === 'draft' ? (
            <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-950/30 px-4 py-3 text-sm text-sf-body">
              This listing is a draft. Visitors will not see it until you publish.
            </p>
          ) : null}

          {event.status === 'archived' || (event.date.end && new Date(`${event.date.end}T23:59:59`) < new Date()) ? (
            <p className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-sf-body">
              This event has ended. Looking for upcoming events?{' '}
              <Link href="/events" className="underline">
                Explore ECKE
              </Link>
            </p>
          ) : null}

          <EventBrandMasthead event={event} media={media} brand={brand} />

          <nav className="event-hub-nav" aria-label="Event discovery links">
            {stateSlug ? (
              <Link href={`/states/${stateSlug}`} className="event-hub-link">
                {stateName} hub
              </Link>
            ) : null}
            {stateSlug ? (
              <Link href={`/bdsm-events/${stateSlug}`} className="event-hub-link">
                More events in {event.location.state}
              </Link>
            ) : null}
            <Link href="/events" className="event-hub-link">
              Browse all events
            </Link>
            <a
              href={ECKE_DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="event-hub-link"
            >
              {ECKE_DISCORD_LABEL}
            </a>
          </nav>

          <div className="event-detail-layout">
            <div>
              <EventWhyGoSection event={event} />
              {hasLongCopy && orgCopyLooksLikeHtml(event.longDescription) ? (
                <section className="event-overview" aria-labelledby="event-overview-title">
                  <h2 id="event-overview-title" className="event-section-title">
                    Overview
                  </h2>
                  <div
                    className="prose prose-invert prose-event mt-4 max-w-none"
                    dangerouslySetInnerHTML={{ __html: listingCopyToSafeHtml(event.longDescription || '') }}
                  />
                </section>
              ) : (hasLongCopy || event.excerpt) ? (
                <EventOverviewModules parsed={parsed} fallbackExcerpt={event.excerpt} />
              ) : null}

              {applications.length ? (
                <section className="mt-8">
                  <h2 className="text-xl font-semibold text-sf-strong">Applications</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {applications.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm text-sf-strong"
                        >
                          <span>{item.label} applications</span>
                          <span className="text-sf-muted">Apply →</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {event.programUrl || event.mapUrl ? (
                <section className="mt-8">
                  <h2 className="text-xl font-semibold text-sf-strong">Program &amp; map</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {event.programUrl ? (
                      <a
                        href={event.programUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center rounded-xl border border-white/10 px-4 py-3 text-sm text-sf-strong"
                      >
                        View program
                      </a>
                    ) : null}
                    {event.mapUrl ? (
                      <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-white/10 p-3">
                        {event.mapUrl.startsWith('blob:') || event.mapUrl.startsWith('data:') ? (
                          // eslint-disable-next-line @next/next/no-img-element -- blob/object-URL map preview; next/image cannot accept blob src
                          <img src={event.mapUrl} alt={`${event.name} event map`} className="max-h-64 w-full rounded-lg object-contain" />
                        ) : (
                          <Image
                            src={event.mapUrl}
                            alt={`${event.name} event map`}
                            width={640}
                            height={256}
                            className="max-h-64 w-full rounded-lg object-contain"
                            unoptimized={listingImageUnoptimized(event.mapUrl)}
                          />
                        )}
                        <p className="mt-2 text-sm text-sf-strong">Event map</p>
                      </a>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {posts.length > 0 ? (
                <section className="mt-8">
                  <h2 className="text-xl font-semibold text-sf-strong">Latest updates</h2>
                  <ol className="mt-4 space-y-4">
                    {posts.map((post) => (
                      <li key={post.id} className="rounded-xl border border-white/10 p-4">
                        <p className="text-xs text-sf-muted">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : post.created_at
                              ? new Date(post.created_at).toLocaleDateString()
                              : ''}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-sf-strong">{post.title}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-sf-body">{post.body}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {hasFeatures ? <EventFeatureTiles features={event.features!} /> : null}

              {event.gallery?.length ? (
                <KinkSocialEntityGallerySection gallery={event.gallery} title="Event photos" />
              ) : null}

              <EventVenueTravel event={event} />

              <EventListingStatus event={event} />

              <details className="group mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <summary className="flex min-h-touch cursor-pointer list-none items-center font-medium text-sf-body hover:text-sf-strong [&::-webkit-details-marker]:hidden">
                  <span className="mr-2 text-sf-violet transition group-open:rotate-90" aria-hidden>
                    ▶
                  </span>
                  Community &amp; discovery links
                </summary>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-sf-muted">
                    Questions about this event? Check the organizer&apos;s site first. For general community chat,
                    join our Discord.
                  </p>
                  <a
                    href={ECKE_DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-hub-link inline-flex"
                  >
                    {ECKE_DISCORD_LABEL}
                  </a>
                  <ListingHubLinks variant="event" stateAbbr={event.location.state} city={event.location.city} />
                  <DiscoveryEngineStrip stateAbbr={event.location.state} />
                </div>
              </details>
            </div>

            <EventActionDock event={event} />
          </div>
        </div>
      </section>

      <div className="container-custom pb-12 event-detail-related">
        <RelatedContent currentEvent={event} />
      </div>

      <EventMobileActionBar event={event} />
    </div>
  )
}
