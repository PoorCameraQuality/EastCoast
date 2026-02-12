export default function AboutSection() {
  return (
    <section className="section-padding bg-black">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              About East Coast Kink Events
            </h2>
            <p className="text-lg text-subtle">
              Connecting communities across the East Coast with elegance and discretion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h3 className="text-2xl font-serif font-semibold text-white mb-6">
                Our Mission
              </h3>
              <div className="space-y-6 text-subtle leading-relaxed">
                <p>
                  We&apos;re dedicated to fostering a safe, inclusive, and vibrant kink community across the East Coast. 
                  Our platform serves as a central hub for discovering events, connecting with like-minded individuals, 
                  and building meaningful relationships within the lifestyle community.
                </p>
                <p>
                  Whether you&apos;re new to the scene or a seasoned participant, we provide resources and opportunities 
                  to explore, learn, and grow within a supportive environment that respects privacy and discretion.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-semibold text-white mb-6">
                What We Do
              </h3>
              <div className="space-y-4 text-subtle">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  <p>Curate and maintain a comprehensive directory of BDSM events and dungeons</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  <p>Provide educational resources and safety guidelines</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  <p>Foster community connections through Discord and events</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  <p>Ensure transparency and safety in all listings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="card-elegant max-w-2xl mx-auto">
              <h3 className="text-2xl font-serif font-semibold text-white mb-4">
                Join Our Community
              </h3>
              <p className="text-subtle mb-8">
                Connect with the community on Discord! Your hub for all discussions kinky.
              </p>
              <a 
                href="https://discord.gg/xcnGGyGsmT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 discord-glow"
              >
                Join Discord Community
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 
