import Link from 'next/link'
import { getDiscoveryEngineStripForStateAbbr } from '@/lib/discoveryCrossLinks'

/**
 * Cross-links events, dungeons, vendors, blog, and education for entity detail pages.
 * `stateAbbr` is a US state code (e.g. NJ, PA) when known from the entity.
 */
export default function DiscoveryEngineStrip({ stateAbbr }: { stateAbbr?: string }) {
  const links = getDiscoveryEngineStripForStateAbbr(stateAbbr)

  return (
    <nav
      className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
      aria-label="Discovery in this region"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-primary-400 mb-2">
        Explore the discovery network
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-2 list-none p-0 m-0 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
