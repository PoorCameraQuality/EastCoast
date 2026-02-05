'use client'

import Link from 'next/link'

type Props = {
  contextLabel: string
}

export default function SupportCTAInline({ contextLabel }: Props) {
  return (
    <aside
      className="mt-6 mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 via-white/4 to-transparent backdrop-blur-xl p-5 md:p-6"
      aria-label="Support this site"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Keep this site self-funded — get featured in {contextLabel}.
          </p>
          <p className="text-sm text-gray-300 mt-1 leading-relaxed">
            Supporter tier ($25/mo) gets sticky placement at the top while people browse. Sponsorships available.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/support" className="btn-primary text-center">
            Support this site
          </Link>
          <Link href="/contact?subject=Supporter%20Tier%20($25%2Fmo)" className="btn-outline text-center">
            Become a Supporter
          </Link>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Sponsorship details via Discord: <span className="text-gray-200 font-semibold">Brax117</span>
      </p>
    </aside>
  )
}

