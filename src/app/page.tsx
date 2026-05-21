import { HomepageStructuredData } from '@/components/StructuredData'
import HubCategoryGrid from '@/components/home/HubCategoryGrid'
import HomeHeroMinimal from '@/components/home/HomeHeroMinimal'
import HomeUpcomingEvents from '@/components/home/HomeUpcomingEvents'
import HomeStateChips from '@/components/home/HomeStateChips'
import HomeDancecardShowcase from '@/components/home/HomeDancecardShowcase'
import HomeQuickLinks from '@/components/home/HomeQuickLinks'
import CommunityCTASection from '@/components/home/CommunityCTASection'
import { getHubCategoryCounts } from '@/lib/homeHubCounts'
import { getUnifiedVendors } from '@/lib/unifiedVendors'

export const revalidate = 600

export default async function Home() {
  const vendors = await getUnifiedVendors()
  const hubCounts = await getHubCategoryCounts({ vendorCount: vendors.length })

  return (
    <>
      <HomepageStructuredData />
      <main lang="en">
        <HomeHeroMinimal />
        <HomeDancecardShowcase />
        <HomeUpcomingEvents />
        <HomeStateChips />
        <HubCategoryGrid counts={hubCounts} />
        <HomeQuickLinks />
        <CommunityCTASection />
      </main>
    </>
  )
}
