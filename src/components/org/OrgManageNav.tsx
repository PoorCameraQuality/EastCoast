import EckeLink from '@/components/EckeLink'

const LINKS = [
  { href: 'manage', label: 'Overview' },
  { href: 'edit', label: 'Details' },
  { href: 'posts', label: 'Posts' },
  { href: 'media', label: 'Media' },
  { href: 'edit#tickets', label: 'Tickets' },
  { href: '', label: 'Event page' },
  { href: 'settings', label: 'Settings' },
] as const

export default function OrgManageNav({ slug, current }: { slug: string; current: string }) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-3" aria-label="Organizer tools">
      {LINKS.map((link) => {
        const href = link.href ? `/events/${slug}/${link.href}` : `/events/${slug}`
        const active = current === link.href || (current === 'page' && !link.href)
        return (
          <EckeLink
            key={link.label}
            href={href}
            className={`rounded-md px-3 py-2 text-sm ${
              active ? 'bg-white/10 text-sf-strong' : 'text-sf-muted hover:text-sf-strong'
            }`}
          >
            {link.label}
          </EckeLink>
        )
      })}
    </nav>
  )
}
