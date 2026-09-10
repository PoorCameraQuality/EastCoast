import type { ReactNode } from 'react'
import { orgCopyLooksLikeHtml, sanitizeOrgHtml } from '@/lib/eckeOrgRichText'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import PlaceActionDock from '@/components/places/PlaceActionDock'
import PlaceAmenitiesGrid from '@/components/places/PlaceAmenitiesGrid'
import { PlaceOwnerCta } from '@/components/places/AdaptivePlaceCard'
import PlaceEventsHere from '@/components/places/PlaceEventsHere'
import PlaceEventsSticky from '@/components/places/PlaceEventsSticky'
import PlaceHowToAttend from '@/components/places/PlaceHowToAttend'
import PlaceMasthead from '@/components/places/PlaceMasthead'
import MarkdownSimple from '@/components/MarkdownSimple'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import EntityPageViewTracker from '@/components/analytics/EntityPageViewTracker'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicPlaceListing } from '@/types/publicPlaceListing'

type Props = {
  place: PublicPlaceListing
  upcomingEvents: PublicEventIndexItem[]
  breadcrumbItems: Array<{ label: string; href: string; current?: boolean }>
  structuredData?: ReactNode
  socialMedia?: Record<string, string | undefined>
  /** Swing club practical details, etc. */
  extraModules?: ReactNode
  leadNotice?: ReactNode
  relatedDungeon?: { slug: string; name: string; location: { city: string; state: string } }
  relatedSwingClub?: { slug: string; name: string; location: { city: string; state: string } }
}

export default function PlaceDetailView({
  place,
  upcomingEvents,
  breadcrumbItems,
  structuredData,
  socialMedia,
  extraModules,
  leadNotice,
  relatedDungeon,
  relatedSwingClub,
}: Props) {
  const longBody = place.description ?? ''
  const hasLongBody = longBody.length > 120
  const analyticsType =
    place.routeKind === 'swing_club' ? 'swingClub' : place.routeKind === 'venue' ? 'venue' : 'dungeon'

  return (
    <DiscoveryPageShell accent="violet">
      <EntityPageViewTracker
        entityType={analyticsType}
        slug={place.slug}
        name={place.name}
        organizerName={place.organizerName}
        pagePath={place.detailPath}
      />
      {structuredData}

      <section className="places-detail-page place-profile-page section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <div className="place-profile-crumb">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {leadNotice}

          <PlaceMasthead place={place} />

          <PlaceEventsHere place={place} events={upcomingEvents} />

          <div className="place-profile-split">
            <div className="place-profile-copy">
              <section className="place-about" aria-labelledby="place-about-heading">
                <h2 id="place-about-heading" className="place-section-title">
                  About this space
                </h2>
                {hasLongBody ? (
                  <div className="place-about-prose">
                    {orgCopyLooksLikeHtml(longBody) ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeOrgHtml(longBody) }} />
                    ) : (
                      <MarkdownSimple content={longBody} />
                    )}
                  </div>
                ) : place.shortSummary ? (
                  <p className="place-about-prose">{place.shortSummary}</p>
                ) : (
                  <p className="place-about-fallback">
                    Details coming soon — check the venue website when available.
                  </p>
                )}
              </section>

              <PlaceHowToAttend place={place} />

              {(place.consentPolicySummary ||
                place.alcoholPolicy ||
                place.photographyPolicy ||
                place.smokingPolicy ||
                place.dressCode) && (
                <section className="place-policies" aria-labelledby="place-policies-heading">
                  <h2 id="place-policies-heading" className="place-section-title">
                    Rules and policies
                  </h2>
                  <ul className="place-policies-list">
                    {place.consentPolicySummary ? <li>{place.consentPolicySummary}</li> : null}
                    {place.alcoholPolicy ? <li>{place.alcoholPolicy}</li> : null}
                    {place.photographyPolicy ? <li>{place.photographyPolicy}</li> : null}
                    {place.smokingPolicy ? <li>{place.smokingPolicy}</li> : null}
                    {place.dressCode ? <li>{place.dressCode}</li> : null}
                  </ul>
                </section>
              )}

              {extraModules}

              <PlaceAmenitiesGrid place={place} />
            </div>

            <PlaceActionDock place={place} socialMedia={socialMedia} />
          </div>

          <p className="place-directory-note">
            Public listing for discovery — not an endorsement. Confirm hours, access, and house rules with the venue
            before you visit.
          </p>

          {place.organizerName ? (
            <section className="place-org-card" aria-labelledby="place-org-heading">
              <h2 id="place-org-heading" className="place-section-title">
                Organizer
              </h2>
              <p className="place-org-name">{place.organizerName}</p>
            </section>
          ) : (
            <section className="place-org-card" aria-labelledby="place-own-heading">
              <h2 id="place-own-heading" className="place-section-title">
                Own or run this space?
              </h2>
              <p className="place-org-copy">
                Create a free ECKE organization to manage this listing and publish events to the public calendar.
              </p>
              <a href="/auth/org/signup" className="place-profile-follow">
                Create an organization
              </a>
            </section>
          )}

          <details className="place-more-links">
            <summary>More links in {place.city} area</summary>
            <div className="place-more-links-body">
              <ListingHubLinks
                variant={place.routeKind === 'swing_club' ? 'swing' : 'dungeon'}
                stateAbbr={place.state}
                city={place.city}
              />
              <DiscoveryEngineStrip stateAbbr={place.state} />
            </div>
          </details>
        </div>
      </section>

      <div className="container-custom pb-12">
        <PlaceOwnerCta compact />
        <RelatedContent currentDungeon={relatedDungeon} currentSwingClub={relatedSwingClub} />
      </div>

      <PlaceEventsSticky />
    </DiscoveryPageShell>
  )
}
