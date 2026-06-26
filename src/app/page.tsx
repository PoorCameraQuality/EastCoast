import { HomepageStructuredData } from '@/components/StructuredData'
import StorefrontHero from '@/components/storefront/StorefrontHero'
import CategoryIconRail from '@/components/storefront/CategoryIconRail'
import FeaturedEventRunway from '@/components/storefront/FeaturedEventRunway'
import IntentCategoryGrid from '@/components/storefront/IntentCategoryGrid'
import PublicPrivateBridge from '@/components/storefront/PublicPrivateBridge'
import RegionalDiscovery from '@/components/storefront/RegionalDiscovery'
import ExploreEcosystemSection from '@/components/storefront/ExploreEcosystemSection'
import OrganizerPublishLoop from '@/components/storefront/OrganizerPublishLoop'
import KinkSocialConversionPanel from '@/components/storefront/KinkSocialConversionPanel'
import { getHomepageStorefrontData } from '@/lib/homepageStorefrontData'

export const revalidate = 600

export default async function Home() {
  const data = await getHomepageStorefrontData()

  return (
    <>
      <HomepageStructuredData />
      <div lang="en" className="ecke-storefront">
        <StorefrontHero
          featuredEvent={data.featuredEvent}
          searchEvents={data.searchEvents}
          searchDungeons={data.searchDungeons}
        />
        <CategoryIconRail />
        <FeaturedEventRunway events={data.upcomingEvents} />
        <IntentCategoryGrid counts={data.hubCounts} />
        <PublicPrivateBridge />
        <RegionalDiscovery featuredState={data.featuredState} states={data.topStates} />
        <ExploreEcosystemSection
          vendors={data.vendorPreview}
          dungeons={data.dungeons}
          guides={data.educationGuides}
        />
        <OrganizerPublishLoop />
        <KinkSocialConversionPanel />
      </div>
    </>
  )
}
