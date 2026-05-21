import Link from 'next/link'

const LINKS = [
  { href: '/dungeons', label: 'Dungeons' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/states', label: 'States' },
] as const

export default function HomeQuickLinks() {
  return (
    <section className="bg-black pb-6 md:pb-8" aria-label="Quick links">
      <div className="container-custom">
        <div className="flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-touch items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-300 shadow-sm backdrop-blur-sm transition hover:border-primary-400/25 hover:bg-primary-500/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
