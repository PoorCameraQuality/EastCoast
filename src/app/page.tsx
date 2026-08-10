import { HomepageStructuredData } from '@/components/StructuredData'
import StorefrontHero from '@/components/storefront/StorefrontHero'
import FeaturedEventRunway from '@/components/storefront/FeaturedEventRunway'
import IntentCategoryGrid from '@/components/storefront/IntentCategoryGrid'
import RegionalDiscovery from '@/components/storefront/RegionalDiscovery'
import ExploreEcosystemSection from '@/components/storefront/ExploreEcosystemSection'
import HomeNextStepsCta from '@/components/storefront/HomeNextStepsCta'
import { getHomepageStorefrontData } from '@/lib/homepageStorefrontData'

export const revalidate = 600

export default async function Home() {
  const data = await getHomepageStorefrontData()

  return (
    <>
      <HomepageStructuredData />
      <div lang="en" className="ecke-storefront">
        <StorefrontHero
          searchEvents={data.searchEvents}
          searchDungeons={data.searchDungeons}
        />
        <FeaturedEventRunway events={data.upcomingEvents} />
        <IntentCategoryGrid counts={data.hubCounts} />
        <RegionalDiscovery states={data.topStates} />
        <ExploreEcosystemSection
          vendors={data.vendorPreview}
          dungeons={data.dungeons}
          guides={data.educationGuides}
        />
        <HomeNextStepsCta />
      </div>
    </>
  )
}
