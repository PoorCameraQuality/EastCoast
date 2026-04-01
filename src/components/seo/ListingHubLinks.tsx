import Link from 'next/link'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { getStateSlugFromAbbr, getCityHubSlugForEvent } from '@/lib/eventDiscoveryLinks'
import { LISTING_EDUCATION_LINKS } from '@/lib/seo/listingEducationLinks'

type Variant = 'event' | 'dungeon' | 'swing'

const SECTION_LABEL: Record<Variant, string> = {
  event: 'Related hubs & guides',
  dungeon: 'Related hubs & guides',
  swing: 'Related hubs & guides',
}

export default function ListingHubLinks({
  variant,
  stateAbbr,
  city,
}: {
  variant: Variant
  stateAbbr: string
  city: string
}) {
  const stateSlug = getStateSlugFromAbbr(stateAbbr)
  const citySlug = getCityHubSlugForEvent(city, stateAbbr)
  const stateName = stateSlug ? EAST_COAST_STATES[stateSlug].name : null

  return (
    <nav
      className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 md:px-5 md:py-4"
      aria-label={SECTION_LABEL[variant]}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-primary-400 mb-3">
        {SECTION_LABEL[variant]}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Directory</h3>
          <ul className="flex flex-col gap-2 list-none p-0 m-0 text-sm text-gray-300">
            {stateSlug && stateName && (
              <li>
                <Link
                  href={`/states/${stateSlug}`}
                  className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {stateName} — events, dungeons &amp; clubs
                </Link>
              </li>
            )}
            {stateSlug && stateName && (
              <li>
                <Link
                  href={`/bdsm-events/${stateSlug}`}
                  className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  BDSM events in {stateName}
                </Link>
              </li>
            )}
            {citySlug && (
              <li>
                <Link
                  href={`/bdsm-events/${citySlug}`}
                  className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {city} hub
                </Link>
              </li>
            )}
            <li>
              <Link href="/states" className="text-gray-400 hover:text-primary-300 underline-offset-2 hover:underline">
                All state directories
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Education</h3>
          <ul className="flex flex-col gap-2 list-none p-0 m-0 text-sm text-gray-300">
            {LISTING_EDUCATION_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
