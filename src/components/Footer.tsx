'use client'

import EckeLink from '@/components/EckeLink'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { usePathname } from 'next/navigation'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import { suppressEckeFooter } from '@/lib/dancecard/shellRoutes'
import { buildEventsListUrl } from '@/lib/eventsListSearchParams'
import {
  buildKinkSocialUrl,
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  getKinkSocialVendorOnboardingUrl,
  KINK_SOCIAL_PATHS,
} from '@/lib/kinkSocialMarketing'

const DISCORD_INVITE_URL = 'https://discord.gg/xcnGGyGsmT'

type FooterLink = { href: string; label: string; external?: boolean }

type FooterSection = {
  title: string
  links: FooterLink[]
}

const sectionId = (title: string) => title.replace(/\s+/g, '-').toLowerCase()

function FooterSectionBlock({ title, links }: FooterSection) {
  const sid = sectionId(title)
  return (
    <section aria-labelledby={sid}>
      <h3
        id={sid}
        className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-sf-muted md:mb-3"
      >
        {title}
      </h3>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-touch items-center rounded-md py-0.5 text-sm text-sf-body hover:text-sf-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sf-bg"
              >
                {link.label}
              </a>
            ) : (
              <EckeLink
                href={link.href}
                className="inline-flex min-h-touch items-center rounded-md py-0.5 text-sm text-sf-body hover:text-sf-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sf-bg"
              >
                {link.label}
              </EckeLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function KinkSocialFooterLink({
  href,
  label,
  surface,
}: {
  href: string
  label: string
  surface: string
}) {
  return (
    <li>
      <KinkSocialCtaLink
        href={href}
        label={label}
        variant="footer"
        surface={surface}
        className="inline-flex min-h-touch items-center rounded-md py-0.5 text-sm text-sf-body hover:text-sf-strong"
        external
      />
    </li>
  )
}

export default function Footer() {
  const pathname = usePathname()
  if (suppressEckeFooter(pathname)) {
    return null
  }

  const discoverLinks: FooterLink[] = [
    { href: '/events', label: 'Events & conventions' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/dungeons', label: 'Places' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/education', label: 'Education' },
    { href: '/states', label: 'States' },
  ]

  const planLinks: FooterLink[] = [
    { href: buildEventsListUrl('this-weekend'), label: 'This weekend' },
    { href: '/events', label: 'Upcoming events' },
    { href: '/states', label: 'State hubs' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/education?path=new-to-kink', label: 'New to kink' },
    { href: '/dungeons', label: 'Browse places' },
  ]

  const helpLinks: FooterLink[] = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: CONTACT_US_LABEL },
    { href: '/report', label: 'Report a problem' },
    { href: '/guidelines', label: 'Guidelines' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/accessibility', label: 'Accessibility' },
    { href: '/sitemap.xml', label: 'Sitemap' },
  ]

  return (
    <footer className="border-t border-white/10 bg-sf-bg text-sf-body">
      {/* Top conversion band */}
      <div className="border-b border-white/10 bg-sf-surface/50">
        <div className="container-custom flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:py-7">
          <div className="max-w-xl">
            <p className="text-lg font-semibold text-sf-strong md:text-xl">
              Find what is happening next.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-sf-muted">
              Browse public events, places, vendors, education, and local scene hubs. Join
              kink.social when you are ready to save, follow, publish, or connect.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <EckeLink href="/events" className="sf-btn-primary whitespace-nowrap text-center">
              Browse events
            </EckeLink>
            <EckeLink href="/states" className="sf-btn-ghost whitespace-nowrap text-center">
              Explore states
            </EckeLink>
            <KinkSocialCtaLink
              href={getKinkSocialJoinUrl('footer')}
              label="Join kink.social"
              variant="footer"
              surface="footer_cta"
              className="sf-btn-rose whitespace-nowrap text-center"
              external
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sf-violet/15 text-sm font-semibold text-sf-violet"
                aria-hidden
              >
                EC
              </div>
              <div>
                <p className="font-semibold text-sf-strong">East Coast Kink Events</p>
                <p className="text-xs text-sf-muted">by kink.social</p>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-sf-muted">
              East Coast Kink Events is the public discovery surface for kink events, places,
              vendors, education, and local scene hubs. kink.social is the community and publishing
              platform behind the scenes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <KinkSocialCtaLink
                href={getKinkSocialJoinUrl('footer')}
                label="Join kink.social"
                variant="footer"
                surface="footer_brand"
                className="sf-btn-rose px-3 py-2 text-xs"
                external
              />
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sf-btn-ghost px-3 py-2 text-xs"
                aria-label="Join Discord (opens in a new tab)"
              >
                Join Discord
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-9"
            aria-label="Footer"
          >
            <FooterSectionBlock title="Discover" links={discoverLinks} />

            <FooterSectionBlock title="Plan" links={planLinks} />

            <section aria-labelledby="footer-publish">
              <h3
                id="footer-publish"
                className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-sf-muted md:mb-3"
              >
                Publish on kink.social
              </h3>
              <ul className="space-y-1.5">
                <KinkSocialFooterLink
                  href={getKinkSocialOrgUrl('footer')}
                  label="Publish an event"
                  surface="footer_publish_event"
                />
                <KinkSocialFooterLink
                  href={getKinkSocialOrgUrl('footer')}
                  label="Create an organization"
                  surface="footer_publish_org"
                />
                <KinkSocialFooterLink
                  href={getKinkSocialVendorOnboardingUrl('footer')}
                  label="Create a vendor profile"
                  surface="footer_publish_vendor"
                />
                <KinkSocialFooterLink
                  href={buildKinkSocialUrl(KINK_SOCIAL_PATHS.educationBrowse, 'footer')}
                  label="Publish education"
                  surface="footer_publish_education"
                />
                <KinkSocialFooterLink
                  href={buildKinkSocialUrl(KINK_SOCIAL_PATHS.orgNew, 'footer', {
                    ref: 'ecke_footer_place',
                  })}
                  label="Publish a place listing"
                  surface="footer_publish_place"
                />
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-sf-muted">
                Publish events, places, vendors, and education to ECKE from kink.social.
              </p>
            </section>

            <FooterSectionBlock title="Help & legal" links={helpLinks} />
          </nav>
        </div>

        {/* Compact support row */}
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-white/8 bg-sf-card/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-sf-strong">Support ECKE</p>
            <p className="mt-0.5 text-xs leading-relaxed text-sf-muted">
              Supporter placement helps keep the public guide online. Sponsorships available via
              Discord: <span className="text-sf-body">Brax117</span>.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <EckeLink href="/support" className="sf-btn-ghost px-3 py-2 text-xs">
              Learn more
            </EckeLink>
            <EckeLink href="/contact" className="sf-btn-ghost px-3 py-2 text-xs">
              Contact
            </EckeLink>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="text-xs text-sf-muted">
            © {new Date().getFullYear()} East Coast Kink Events. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
