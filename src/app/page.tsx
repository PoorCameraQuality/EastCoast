import AboutSection from '@/components/AboutSection'
import { HomepageStructuredData } from '@/components/StructuredData'
import HubCategoryGrid from '@/components/home/HubCategoryGrid'
import FeaturedEventsSection from '@/components/home/FeaturedEventsSection'
import FeaturedDungeonsSection from '@/components/home/FeaturedDungeonsSection'
import FeaturedVendorsSection from '@/components/home/FeaturedVendorsSection'
import EducationSpotlightSection from '@/components/home/EducationSpotlightSection'
import CommunityCTASection from '@/components/home/CommunityCTASection'

export default function Home() {
  return (
    <>
      <HomepageStructuredData />
      <main lang="en">
        <HubCategoryGrid />
        <FeaturedEventsSection />
        <FeaturedDungeonsSection />
        <FeaturedVendorsSection />
        <EducationSpotlightSection />
        <CommunityCTASection />
        <AboutSection />
      </main>
    </>
  )
} 
