import Link from 'next/link'
import type { BlogInternalLinksBundle } from '@/lib/blogInternalLinks'

type Props = {
  bundle: BlogInternalLinksBundle
  /** When true, tighter spacing for programmatic guides (listings before long-form copy). */
  embedded?: boolean
}

export default function BlogExplorePlatformSection({ bundle, embedded }: Props) {
  const sectionClass = embedded
    ? 'mt-6 mb-10 pt-8 border-t border-gray-800'
    : 'mt-12 pt-10 border-t border-gray-800'

  return (
    <section className={sectionClass} aria-label="Explore the platform">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Explore the platform</h2>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Use these links to move from reading to real listings: upcoming events, trusted vendors, and dungeon
        spaces with clear onboarding.
      </p>

      <div className="grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="text-primary-400 font-semibold mb-3">Events</h3>
          <ul className="space-y-2 list-none p-0 m-0">
            {bundle.events.map((l) => (
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
        </div>
        <div>
          <h3 className="text-primary-400 font-semibold mb-3">Vendors</h3>
          <ul className="space-y-2 list-none p-0 m-0">
            {bundle.vendors.map((l) => (
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
        </div>
        <div>
          <h3 className="text-primary-400 font-semibold mb-3">Dungeons & venues</h3>
          <ul className="space-y-2 list-none p-0 m-0">
            {bundle.dungeons.map((l) => (
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
        </div>
      </div>

      <div className="mt-10">
        <Link
          href={bundle.ctaHref}
          className="btn-primary min-h-touch inline-flex items-center justify-center px-6 py-3 text-base"
        >
          {bundle.ctaLabel}
        </Link>
      </div>
    </section>
  )
}
