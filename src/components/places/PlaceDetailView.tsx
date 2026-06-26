import type { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import ListingHubLinks from '@/components/seo/ListingHubLinks'
import PlaceActionDock from '@/components/places/PlaceActionDock'
import PlaceAmenitiesGrid from '@/components/places/PlaceAmenitiesGrid'
import { PlaceOwnerCta } from '@/components/places/AdaptivePlaceCard'
import PlaceEventsHere from '@/components/places/PlaceEventsHere'
import PlaceGallerySection from '@/components/places/PlaceGallerySection'
import PlaceHowToAttend from '@/components/places/PlaceHowToAttend'
import PlaceMasthead from '@/components/places/PlaceMasthead'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import MarkdownSimple from '@/components/MarkdownSimple'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import { buildKinkSocialUrl, KINK_SOCIAL_PATHS } from '@/lib/kinkSocialMarketing'
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
  relatedDungeon,
  relatedSwingClub,
}: Props) {
  const longBody = place.description ?? ''
  const hasLongBody = longBody.length > 120

  return (
    <DiscoveryPageShell accent="violet">
      {structuredData}

      <section className="places-detail-page section-padding pt-4 md:pt-6">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />

          <PlaceMasthead place={place} />

          <div className="place-detail-layout">
            <div className="place-detail-main">
              <PlaceGallerySection place={place} />

              <section className="place-about" aria-labelledby="place-about-heading">
                <h2 id="place-about-heading" className="place-section-title">
                  About this space
                </h2>
                {hasLongBody ? (
                  <div className="place-about-prose">
                    <MarkdownSimple content={longBody} />
                  </div>
                ) : (
                  <p className="place-about-fallback">
                    Details coming soon — check the venue website when available.
                  </p>
                )}
                <p className="place-about-disclaimer">
                  Public listing for discovery — not an endorsement. Confirm hours, access, and house rules with the
                  venue before you visit.
                </p>
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

              <PlaceEventsHere place={place} events={upcomingEvents} />

              {place.sourceSystem === 'kink_social' || place.organizerName ? (
                <section className="place-org-card" aria-labelledby="place-org-heading">
                  <h2 id="place-org-heading" className="place-section-title">
                    {place.sourceSystem === 'kink_social' ? 'Managed on kink.social' : 'Organizer'}
                  </h2>
                  {place.organizerName ? (
                    <p className="place-org-name">{place.organizerName}</p>
                  ) : null}
                  <KinkSocialCtaLink
                    href={
                      place.followUrl ??
                      buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, 'dungeon_page', {
                        ref: 'ecke_place_org',
                        ecke_place: place.slug,
                      })
                    }
                    label="Follow on kink.social"
                    variant="dungeon"
                    surface="place_organization"
                    className="place-btn place-btn-save"
                    external
                  />
                </section>
              ) : (
                <section className="place-org-card" aria-labelledby="place-own-heading">
                  <h2 id="place-own-heading" className="place-section-title">
                    Own or run this space?
                  </h2>
                  <p className="place-org-copy">
                    Create or claim an organization on kink.social to manage your public profile and publish events to
                    ECKE.
                  </p>
                  <KinkSocialCtaLink
                    href={buildKinkSocialUrl(KINK_SOCIAL_PATHS.orgNew, 'organizer', {
                      ref: 'ecke_place_claim',
                      ecke_place: place.slug,
                    })}
                    label="Create or claim on kink.social"
                    variant="organizer"
                    surface="place_claim"
                    className="place-btn place-btn-save"
                    external
                  />
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

            <PlaceActionDock place={place} socialMedia={socialMedia} />
          </div>
        </div>
      </section>

      <div className="container-custom pb-12">
        <PlaceOwnerCta compact />
        <RelatedContent
          currentDungeon={relatedDungeon}
          currentSwingClub={relatedSwingClub}
        />
      </div>
    </DiscoveryPageShell>
  )
}
