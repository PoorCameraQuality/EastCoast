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
                What We Offer
              </h3>
              <ul className="space-y-4 text-subtle">
                <li className="flex items-start">
                  <span className="text-primary-400 mr-3 mt-1">✓</span>
                  <span>Comprehensive event listings across the East Coast</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-3 mt-1">✓</span>
                  <span>Safe and inclusive community guidelines</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-3 mt-1">✓</span>
                  <span>Event submission and promotion tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-3 mt-1">✓</span>
                  <span>Educational resources and workshops</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-400 mr-3 mt-1">✓</span>
                  <span>Community networking opportunities</span>
                </li>
              </ul>
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
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 
