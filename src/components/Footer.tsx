'use client'

import EckeLink from '@/components/EckeLink'
import { usePathname } from "next/navigation";
import { CONTACT_US_LABEL } from "@/lib/submissionContact";
import { suppressEckeFooter } from "@/lib/dancecard/shellRoutes";
import {
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  KINK_SOCIAL_LABELS,
} from '@/lib/kinkSocialMarketing'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'

const DISCORD_INVITE_URL = "https://discord.gg/xcnGGyGsmT";

const sectionId = (title: string) =>
  title.replace(/\s+/g, "-").toLowerCase();

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const sid = sectionId(title);
  return (
    <section aria-labelledby={sid}>
      <h3
        id={sid}
        className="mb-3 text-sm font-semibold tracking-wide text-sf-strong md:mb-4"
      >
        {title}
      </h3>
      <ul className="space-y-2">
        {children}
      </ul>
    </section>
  );
};

const L = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <li>
    <EckeLink
      href={href}
      className="inline-flex min-h-touch items-center rounded-md py-1 text-sf-muted hover:text-sf-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sf-bg"
    >
      {children}
    </EckeLink>
  </li>
);

export default function Footer() {
  const pathname = usePathname()
  if (suppressEckeFooter(pathname)) {
    return null
  }

  return (
    <footer className="border-t border-white/10 bg-sf-bg text-sf-body">
      <div className="border-b border-white/10 bg-sf-surface/60">
        <div className="container-custom flex flex-col items-center justify-between gap-4 py-ecke-6 text-center md:flex-row md:text-left">
          <p className="text-lg font-semibold text-sf-strong">Ready to find your next event?</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <EckeLink href="/events" className="sf-btn-primary">
              Browse events
            </EckeLink>
            <KinkSocialCtaLink
              href={getKinkSocialJoinUrl('footer')}
              label="Join kink.social"
              variant="footer"
              surface="footer_cta"
              className="sf-btn-rose"
              external
            />
          </div>
        </div>
      </div>

      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sf-violet/15 text-sm font-semibold text-sf-violet">
                EC
              </div>
              <div>
                <p className="font-semibold text-sf-strong">
                  East Coast Kink Events
                </p>
                <p className="text-xs text-sf-muted">by kink.social</p>
              </div>
            </div>
            <p className="mt-4 max-w-prose text-sm leading-7 text-sf-muted">
              East Coast Kink Events is the public discovery surface for kink events, places, vendors,
              education, and community listings. kink.social is the free community and event-management
              platform behind the scenes.
            </p>

            <div className="mt-6">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-touch items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sf-strong hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sf-bg"
                aria-label="Join Discord (opens in a new tab)"
              >
                Join Discord
              </a>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-sf-card/40 p-4">
              <p className="text-sm font-semibold text-sf-strong">Support this site</p>
              <p className="mt-1 text-sm leading-6 text-sf-muted">
                Supporter tier ($25/mo) gets sticky placement while people browse. Sponsorships available via Discord: <span className="font-semibold text-sf-body">Brax117</span>.
              </p>
              <div className="mt-3">
                <EckeLink
                  href="/support"
                  className="sf-btn-ghost text-sm"
                >
                  Learn more
                </EckeLink>
              </div>
            </div>
          </div>

          <nav
            className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5"
            aria-label="Footer"
          >
            <Section title="Explore">
              <L href="/events">Events</L>
              <L href="/calendar">Calendar</L>
              <L href="/states">States</L>
              <L href="/dungeons">Dungeons &amp; clubs</L>
              <L href="/vendors">Vendors</L>
              <L href="/education">Education</L>
              <L href="/groups">Groups</L>
              <L href="/organizations">Organizations</L>
              <L href="/conventions">Conventions</L>
              <L href="/presenters">Presenters</L>
              <L href="/venues">Venues</L>
            </Section>

            <Section title="For organizers">
              <li>
                <KinkSocialCtaLink
                  href={getKinkSocialOrgUrl('footer')}
                  label={KINK_SOCIAL_LABELS.createOrg}
                  variant="footer"
                  surface="footer_organizers"
                  className="inline-flex min-h-touch items-center py-1 text-sf-muted hover:text-sf-strong"
                  external
                />
              </li>
              <li>
                <KinkSocialCtaLink
                  href={getKinkSocialOrgUrl('footer')}
                  label={KINK_SOCIAL_LABELS.publishToEcke}
                  variant="footer"
                  surface="footer_organizers"
                  className="inline-flex min-h-touch items-center py-1 text-sf-muted hover:text-sf-strong"
                  external
                />
              </li>
              <L href="/support">Support this site</L>
              <L href="/contact">{CONTACT_US_LABEL}</L>
            </Section>

            <Section title="kink.social">
              <li>
                <KinkSocialCtaLink
                  href={getKinkSocialJoinUrl('footer')}
                  label="Join free"
                  variant="footer"
                  surface="footer_nav"
                  className="inline-flex min-h-touch items-center py-1 text-sf-muted hover:text-sf-strong"
                  external
                />
              </li>
              <L href="/dancecard">Dancecard</L>
              <li>
                <KinkSocialCtaLink
                  href={getKinkSocialOrgUrl('footer')}
                  label="Create organization"
                  variant="footer"
                  surface="footer_nav"
                  className="inline-flex min-h-touch items-center py-1 text-sf-muted hover:text-sf-strong"
                  external
                />
              </li>
              <L href="/dancecard/organizers">Organizer tools</L>
            </Section>

            <Section title="Community">
              <L href="/about">About</L>
              <L href="/guidelines">Guidelines</L>
              <li>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-touch items-center rounded-md py-1 text-sf-muted hover:text-sf-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus"
                >
                  Discord
                </a>
              </li>
              <L href="/report">Report a problem</L>
            </Section>

            <Section title="Legal">
              <L href="/privacy">Privacy</L>
              <L href="/terms">Terms</L>
              <L href="/accessibility">Accessibility</L>
              <L href="/sitemap.xml">Sitemap</L>
            </Section>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10" />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-sf-muted">
            © {new Date().getFullYear()} East Coast Kink Events. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
