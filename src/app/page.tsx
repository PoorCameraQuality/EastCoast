import Hero from '@/components/Hero'
import EventsSection from '@/components/EventsSection'
import PastEventsSection from '@/components/PastEventsSection'
import AboutSection from '@/components/AboutSection'
import { HomepageStructuredData } from '@/components/StructuredData'

export default function Home() {
  return (
    <>
      <HomepageStructuredData />
      <main lang="en">
        <Hero />
        <EventsSection />
        <PastEventsSection />
        <AboutSection />
      </main>
    </>
  )
} 
