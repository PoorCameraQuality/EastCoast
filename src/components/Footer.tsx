// src/components/Footer.tsx
import Link from "next/link";
import { CONTACT_US_LABEL } from "@/lib/submissionContact";

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
        className="text-sm font-semibold tracking-wide text-gray-200 mb-3 md:mb-4"
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
    <Link
      href={href}
      className="text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-brand-void rounded-md min-h-touch inline-flex items-center py-1"
    >
      {children}
    </Link>
  </li>
);

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-black to-dark-900 text-gray-300 border-t border-dark-700/50">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-dark-800 flex items-center justify-center text-white font-semibold border border-dark-600">
                EC
              </div>
              <div>
                <p className="font-semibold text-white">
                  East Coast Kink Events
                </p>
                <p className="text-xs text-gray-500">
                  Community • Events • Education
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-400 max-w-prose">
              Connecting kink communities across the East Coast. Find events,
              make friends, and explore safely with discretion and elegance.
            </p>

            <div className="mt-6">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-touch rounded-lg bg-amber-400/90 px-4 py-2 text-sm font-medium text-black hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-void"
                aria-label="Join Discord (opens in a new tab)"
              >
                Join Discord
              </a>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <p className="text-sm font-semibold text-white">Support this site</p>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Supporter tier ($25/mo) gets sticky placement while people browse. Sponsorships available via Discord: <span className="text-gray-200 font-semibold">Brax117</span>.
              </p>
              <div className="mt-3">
                <Link
                  href="/support"
                  className="inline-flex items-center min-h-touch rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ecke-focus focus-visible:ring-offset-2 focus-visible:ring-offset-brand-void"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>

          <nav
            className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3"
            aria-label="Footer"
          >
            <Section title="Explore">
              <L href="/events">Events</L>
              <L href="/dungeons">Dungeons &amp; clubs</L>
              <L href="/education">Education</L>
              <L href="/vendors">Vendors</L>
              <L href="/calendar">Calendar</L>
              <L href="/states">States</L>
              <L href="/directory-snapshot">Directory snapshot</L>
              <L href="/spirituality-kink">Spirituality &amp; kink</L>
            </Section>

            <Section title="Community">
              <L href="/contact">{CONTACT_US_LABEL}</L>
              <L href="/about">About</L>
              <L href="/guidelines">Guidelines</L>
              <L href="/support">Support this site</L>
            </Section>

            <Section title="Legal">
              <L href="/privacy">Privacy Policy</L>
              <L href="/terms">Terms of Service</L>
              <L href="/guidelines">Community Guidelines</L>
            </Section>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10" />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} East Coast Kink Events. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
            <li>
              <Link href="/sitemap.xml" className="hover:text-white focus-visible:ring-2 focus-visible:ring-ecke-focus rounded">
                Sitemap
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:text-white focus-visible:ring-2 focus-visible:ring-ecke-focus rounded">
                Accessibility
              </Link>
            </li>
            <li>
              <Link href="/report" className="hover:text-white focus-visible:ring-2 focus-visible:ring-ecke-focus rounded">
                Report a Problem
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
