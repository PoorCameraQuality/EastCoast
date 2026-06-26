import EckeLink from '@/components/EckeLink'
import {
  IconConventions,
  IconEducation,
  IconEvents,
  IconPlaces,
  IconStates,
  IconVendors,
} from '@/components/storefront/CategoryIcons'

const CATEGORIES = [
  { href: '/events', label: 'Events', Icon: IconEvents, tint: 'sf-category-tile-violet' },
  { href: '/conventions', label: 'Conventions', Icon: IconConventions, tint: 'sf-category-tile-warm' },
  { href: '/dungeons', label: 'Places', Icon: IconPlaces, tint: 'sf-category-tile-blue' },
  { href: '/vendors', label: 'Vendors', Icon: IconVendors, tint: 'sf-category-tile-fresh' },
  { href: '/education', label: 'Education', Icon: IconEducation, tint: 'sf-category-tile-neutral' },
  { href: '/states', label: 'States', Icon: IconStates, tint: 'sf-category-tile-violet' },
] as const

export default function CategoryIconRail() {
  return (
    <nav className="sf-section-tight border-b border-white/[0.06]" aria-label="Browse categories">
      <div className="container-custom">
        <ul className="sf-category-rail">
          {CATEGORIES.map((cat) => (
            <li key={cat.href}>
              <EckeLink href={cat.href} className={`sf-category-tile sf-card-lift ${cat.tint}`}>
                <cat.Icon />
                <span className="sf-category-label">{cat.label}</span>
              </EckeLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
