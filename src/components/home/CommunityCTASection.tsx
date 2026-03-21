import Link from 'next/link'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'

const DISCORD_INVITE_URL = 'https://discord.gg/xcnGGyGsmT'

export default function CommunityCTASection() {
  return (
    <section className="section-padding bg-black relative overflow-hidden" aria-labelledby="community-cta-title">
      <div className="absolute inset-0 opacity-10 motion-reduce:opacity-0 pointer-events-none" aria-hidden>
        <div className="absolute top-10 left-10 w-44 h-44 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-44 h-44 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 md:p-12 shadow-dark">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <h2 id="community-cta-title" className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                Community, with discretion
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Connect safely. Find events, learn best practices, and meet people who value consent, privacy, and inclusion.
              </p>
              <blockquote className="border-l-2 border-primary-400/40 pl-4 text-gray-400 italic">
                “A calm, respectful hub makes it easier to find your people.”
              </blockquote>
            </div>

            <div className="md:col-span-5 flex flex-col gap-3">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary discord-glow text-center min-h-touch inline-flex items-center justify-center"
                aria-label="Join our Discord community (opens in a new tab)"
              >
                Join Community (Discord)
              </a>
              <Link href="/contact" className="btn-outline text-center min-h-touch inline-flex items-center justify-center" aria-label="Contact us">
                {CONTACT_US_LABEL}
              </Link>
              <p className="text-xs text-gray-500 text-center">
                We do not require personal details to browse listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

