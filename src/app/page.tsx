import AboutSection from '@/components/AboutSection'
import { HomepageStructuredData } from '@/components/StructuredData'
import HubCategoryGrid from '@/components/home/HubCategoryGrid'
import FeaturedEventsSection from '@/components/home/FeaturedEventsSection'
import FeaturedDungeonsSection from '@/components/home/FeaturedDungeonsSection'
import FeaturedVendorsSection from '@/components/home/FeaturedVendorsSection'
import EducationSpotlightSection from '@/components/home/EducationSpotlightSection'
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
        <HubCategoryGrid counts={hubCounts} />
        <FeaturedEventsSection />
        <FeaturedDungeonsSection />
        <FeaturedVendorsSection vendors={vendors} />
        <EducationSpotlightSection />
        <CommunityCTASection />
        <AboutSection />
      </main>
    </>
  )
} 
