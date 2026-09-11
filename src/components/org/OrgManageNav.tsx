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
    <nav className="org-manage-nav" aria-label="Organizer tools">
      {LINKS.map((link) => {
        const href = link.href ? `/events/${slug}/${link.href}` : `/events/${slug}`
        const active = current === link.href || (current === 'page' && !link.href)
        return (
          <EckeLink
            key={link.label}
            href={href}
            className={active ? 'org-manage-nav-tab is-active' : 'org-manage-nav-tab'}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </EckeLink>
        )
      })}
    </nav>
  )
}
