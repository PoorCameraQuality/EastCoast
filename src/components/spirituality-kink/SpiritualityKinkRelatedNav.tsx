import Link from 'next/link'
import { SPIRITUALITY_KINK_BASE, spokePath } from '@/lib/spiritualityKinkProgrammatic'

type Current = 'hub' | 'maryland' | 'north-carolina' | 'east-coast'

export default function SpiritualityKinkRelatedNav({ current }: { current: Current }) {
  const item = (key: Current, href: string, label: string) => {
    if (current === key) {
      return (
        <span className="text-primary-300 font-medium" aria-current="page">
          {label}
        </span>
      )
    }
    return (
      <Link href={href} className="text-primary-400 hover:underline">
        {label}
      </Link>
    )
  }

  return (
    <nav
      className="mt-14 rounded-xl border border-dark-600 bg-dark-900/40 p-6 md:p-8"
      aria-label="Spirituality and kink section navigation"
    >
      <h2 className="text-lg font-serif font-semibold text-white mb-4">Explore this section</h2>
      <ul className="space-y-2 text-gray-300 text-sm md:text-base">
        <li>{item('hub', SPIRITUALITY_KINK_BASE, 'Directory hub — sacred kink & conscious sexuality')}</li>
        <li>
          {item(
            'maryland',
            spokePath('maryland-sacred-kink-gatherings'),
            'Maryland sacred kink & ritual gatherings'
          )}
        </li>
        <li>
          {item(
            'north-carolina',
            spokePath('north-carolina-rope-embodiment'),
            'North Carolina rope & embodiment (Elevation Rope)'
          )}
        </li>
        <li>
          {item(
            'east-coast',
            spokePath('east-coast-conscious-kink'),
            'East Coast conscious kink — regional overview'
          )}
        </li>
        <li>
          <Link href="/events" className="text-primary-400 hover:underline">
            All events on ECKE
          </Link>
        </li>
        <li>
          <Link href="/education" className="text-primary-400 hover:underline">
            Education & articles
          </Link>
        </li>
        <li>
          <Link href="/states/maryland" className="text-primary-400 hover:underline">
            Maryland state hub
          </Link>
        </li>
        <li>
          <Link href="/states/north-carolina" className="text-primary-400 hover:underline">
            North Carolina state hub
          </Link>
        </li>
      </ul>
    </nav>
  )
}
