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
import KinkSocialEntityGallerySection from '@/components/kink-social/KinkSocialEntityGallerySection'
import { stateAbbrToSlug } from '@/lib/discoveryCrossLinks'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import type { EventPageRecord } from '@/lib/unifiedEvents'
import { resolveKinkSocialEventCtaUrl } from '@/lib/kinkSocialIngestValidation'
import { parseEventDescription } from '@/lib/eventPageContent'
import type { EventMedia } from '@/lib/eventMedia'
import type { EventBrandTheme } from '@/lib/eventBrandTheme'
import { eventBrandStyle } from '@/lib/eventBrandTheme'

type Props = {
  event: EventPageRecord
  media: EventMedia
  brand: EventBrandTheme
}

export default function EventDetailView({ event, media, brand }: Props) {
  const stateSlug = stateAbbrToSlug(event.location.state)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : event.location.state
  const hasFeatures = Boolean(event.features?.length)
  const hasLongCopy = Boolean(event.longDescription?.trim())
  const parsed = hasLongCopy ? parseEventDescription(event.longDescription!) : { intro: '', sections: [] }
  const isC2kSourced = Boolean(event.c2kSourceId)
  const safeKinkSocialEventUrl = isC2kSourced
    ? resolveKinkSocialEventCtaUrl({
        c2kSourceId: event.c2kSourceId,
        c2kSourceType: event.c2kSourceType,
        eckeSlug: event.slug,
      })
    : null

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: event.name, href: `/events/${event.slug}`, current: true },
  ]

  return (
    <div className="event-detail-page discovery-page" style={eventBrandStyle(brand)}>
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
          </nav>

          <div className="event-detail-layout">
            <div>
              <EventWhyGoSection event={event} />

              {(hasLongCopy || event.excerpt) && (
                <EventOverviewModules parsed={parsed} fallbackExcerpt={event.excerpt} />
              )}

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
                  <Link
                    href="https://discord.gg/xcnGGyGsmT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-hub-link inline-flex"
                  >
                    Join Discord
                  </Link>
                  <ListingHubLinks variant="event" stateAbbr={event.location.state} city={event.location.city} />
                  <DiscoveryEngineStrip stateAbbr={event.location.state} />
                </div>
              </details>
            </div>

            <EventActionDock
              event={event}
              safeKinkSocialEventUrl={safeKinkSocialEventUrl}
              isC2kSourced={isC2kSourced}
            />
          </div>
        </div>
      </section>

      <div className="container-custom pb-12 event-detail-related">
        <RelatedContent currentEvent={event} />
      </div>

      <EventMobileActionBar event={event} safeKinkSocialEventUrl={safeKinkSocialEventUrl} />
    </div>
  )
}
