import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Guidelines - East Coast Kink Events',
  description: 'Learn about our community guidelines for creating a safe, inclusive, and respectful environment for all kink enthusiasts.',
  keywords: 'community guidelines, safety, inclusivity, consent, kink community, BDSM guidelines',
  openGraph: {
    title: 'Community Guidelines - East Coast Kink Events',
    description: 'Learn about our community guidelines for creating a safe, inclusive, and respectful environment for all kink enthusiasts.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/guidelines',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Community Guidelines - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Guidelines - East Coast Kink Events',
    description: 'Learn about our community guidelines for creating a safe, inclusive environment.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Community Guidelines
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              Building a safe, inclusive, and respectful community for everyone.
            </p>
          </div>

          {/* Content */}
          <div className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8 text-subtle leading-relaxed">
                
                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    Our Mission
                  </h2>
                  <p className="mb-4">
                    East Coast Kink Events is dedicated to fostering a safe, inclusive, and respectful 
                    community for all individuals interested in kink, BDSM, and alternative lifestyles. 
                    We believe in creating spaces where everyone feels welcome, valued, and safe to 
                    explore their interests.
                  </p>
                  <p>
                    These guidelines are designed to ensure that our community remains a positive, 
                    supportive environment for all members, regardless of their background, identity, 
                    or experience level.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    1. Inclusivity & Respect
                  </h2>
                  <p className="mb-4">
                    We are committed to creating an inclusive environment that welcomes and respects 
                    all individuals, regardless of:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Gender identity and expression</li>
                    <li>Sexual orientation and attraction</li>
                    <li>Race, ethnicity, and cultural background</li>
                    <li>Age (18+ only)</li>
                    <li>Body type, size, and ability</li>
                    <li>Experience level in kink and BDSM</li>
                    <li>Relationship structure (monogamous, polyamorous, etc.)</li>
                    <li>Religious or spiritual beliefs</li>
                    <li>Socioeconomic status</li>
                  </ul>
                  <p className="mt-4">
                    Discrimination, harassment, or exclusion based on any of these factors will not 
                    be tolerated.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    2. Consent & Safety
                  </h2>
                  <p className="mb-4">
                    <strong>Consent is fundamental.</strong> All interactions must be based on 
                    enthusiastic, informed, and ongoing consent.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Always obtain explicit consent before any physical contact</li>
                    <li>Respect when someone says "no" or "stop"</li>
                    <li>Check in regularly during any activities</li>
                    <li>Understand that consent can be withdrawn at any time</li>
                    <li>Never pressure or coerce anyone into activities</li>
                    <li>Respect personal boundaries and limits</li>
                  </ul>
                  <p className="mt-4">
                    If you witness non-consensual behavior, report it immediately to event organizers 
                    or website administrators.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    3. Communication & Behavior
                  </h2>
                  <p className="mb-4">
                    Treat all community members with respect, kindness, and professionalism:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use respectful and inclusive language</li>
                    <li>Ask for and use people's preferred names and pronouns</li>
                    <li>Respect personal space and boundaries</li>
                    <li>Listen actively and be open to learning</li>
                    <li>Share knowledge and experiences constructively</li>
                    <li>Support newcomers and those with less experience</li>
                    <li>Address conflicts respectfully and privately</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    4. Privacy & Discretion
                  </h2>
                  <p className="mb-4">
                    Respect the privacy and confidentiality of all community members:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Do not share personal information about others without permission</li>
                    <li>Respect the anonymity of those who choose to remain private</li>
                    <li>Do not "out" people as kinky to others</li>
                    <li>Be mindful of photos and social media sharing</li>
                    <li>Respect event photography policies</li>
                    <li>Understand that many people need discretion for personal or professional reasons</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    5. Event Participation
                  </h2>
                  <p className="mb-4">
                    When attending events listed on our website:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Read and follow all event-specific rules and guidelines</li>
                    <li>Arrive on time and respect event schedules</li>
                    <li>Dress appropriately for the event type and venue</li>
                    <li>Bring necessary supplies and equipment</li>
                    <li>Clean up after yourself and respect venue spaces</li>
                    <li>Follow venue-specific rules and policies</li>
                    <li>Be respectful of event organizers and volunteers</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    6. Online Behavior
                  </h2>
                  <p className="mb-4">
                    When interacting through our website, Discord, or other online platforms:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be respectful in all online communications</li>
                    <li>Do not spam, troll, or engage in disruptive behavior</li>
                    <li>Respect different opinions and perspectives</li>
                    <li>Use appropriate language and avoid excessive profanity</li>
                    <li>Do not share explicit content without proper warnings</li>
                    <li>Report inappropriate behavior to moderators</li>
                    <li>Remember that online interactions can have real-world consequences</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    7. Education & Learning
                  </h2>
                  <p className="mb-4">
                    We encourage continuous learning and growth:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be open to learning from others' experiences</li>
                    <li>Share knowledge respectfully and accurately</li>
                    <li>Recognize that everyone's journey is different</li>
                    <li>Support educational events and workshops</li>
                    <li>Be patient with newcomers and those learning</li>
                    <li>Understand that kink and BDSM are diverse practices</li>
                    <li>Respect different approaches and philosophies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    8. Health & Safety
                  </h2>
                  <p className="mb-4">
                    Prioritize health and safety in all activities:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Practice safe sex and use appropriate protection</li>
                    <li>Be aware of and respect health status disclosures</li>
                    <li>Understand and follow safety protocols for activities</li>
                    <li>Have emergency contact information available</li>
                    <li>Know your limits and communicate them clearly</li>
                    <li>Seek medical attention when needed</li>
                    <li>Support harm reduction practices</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    9. Reporting & Enforcement
                  </h2>
                  <p className="mb-4">
                    If you experience or witness violations of these guidelines:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Report incidents promptly to organizers or moderators</li>
                    <li>Provide specific details about what occurred</li>
                    <li>Support those who come forward with concerns</li>
                    <li>Cooperate with investigations when requested</li>
                    <li>Understand that violations may result in removal from events or platforms</li>
                    <li>Know that serious violations may be reported to appropriate authorities</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    10. Age & Legal Requirements
                  </h2>
                  <p className="mb-4">
                    All participants must be 18 years of age or older:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Valid ID may be required at events</li>
                    <li>No exceptions to the age requirement</li>
                    <li>All activities must comply with local laws</li>
                    <li>Understand that some venues may have higher age requirements</li>
                    <li>Respect venue-specific age policies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    11. Support & Resources
                  </h2>
                  <p className="mb-4">
                    We believe in supporting our community:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Join our Discord community for ongoing support and discussion</li>
                    <li>Connect with experienced community members for guidance</li>
                    <li>Attend educational workshops and events</li>
                    <li>Seek out mentors or experienced practitioners</li>
                    <li>Access resources for mental health and support</li>
                    <li>Know that you're not alone in your journey</li>
                  </ul>
                </section>

                <div className="border-t border-dark-600 pt-8 mt-12">
                  <h3 className="text-xl font-serif font-semibold text-white mb-4">
                    Final Notes
                  </h3>
                  <p className="mb-4">
                    These guidelines are living documents that may be updated as our community grows 
                    and evolves. We encourage feedback and suggestions for improvement.
                  </p>
                  <p className="mb-4">
                    Remember: We're all here to learn, grow, and support each other. By following 
                    these guidelines, you help create the safe, inclusive community we all deserve.
                  </p>
                  <p className="text-sm text-gray-400">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
