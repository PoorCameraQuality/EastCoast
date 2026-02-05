// src/components/Footer.tsx
import Link from "next/link";
import { CONTACT_US_LABEL } from "@/lib/submissionContact";

const DISCORD_INVITE_URL = "https://discord.gg/xcnGGyGsmT";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
    <h3
      id={title.replace(/\s+/g, "-").toLowerCase()}
      className="text-sm font-semibold tracking-wide text-slate-200 mb-3 md:mb-4"
    >
      {title}
    </h3>
    <ul className="space-y-2">
      {children}
    </ul>
  </section>
);

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
      className="text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
    >
      {children}
    </Link>
  </li>
);

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-8">
          {/* Brand + blurb */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-100 font-semibold">
                EC
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  East Coast Kink Events
                </p>
                <p className="text-xs text-slate-400">
                  Community • Events • Education
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300/90 max-w-prose">
              Connecting kink communities across the East Coast. Find events,
              make friends, and explore safely with discretion and elegance.
            </p>

            <div className="mt-6">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-amber-400/90 px-3 py-2 text-sm font-medium text-black hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Join Discord (opens in a new tab)"
              >
                Join Discord
              </a>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-slate-100">Support this site</p>
              <p className="mt-1 text-sm leading-6 text-slate-300/90">
                Supporter tier ($25/mo) gets sticky placement while people browse. Sponsorships available via Discord: <span className="text-slate-100 font-semibold">Brax117</span>.
              </p>
              <div className="mt-3">
                <Link
                  href="/support"
                  className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>

          {/* Link groups */}
          <nav
            className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3"
            aria-label="Footer"
          >
            <Section title="Explore">
              <L href="/events">Events</L>
              <L href="/dungeons">Dungeons</L>
              <L href="/education">Education</L>
              <L href="/vendors">Vendors</L>
              <L href="/calendar">Calendar</L>
              <L href="/states">States</L>
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

        {/* Divider */}
        <div className="mt-10 border-t border-white/10" />

        {/* Bottom row */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} East Coast Kink Events. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <li>
              <Link href="/sitemap.xml" className="hover:text-white">
                Sitemap
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:text-white">
                Accessibility
              </Link>
            </li>
            <li>
              <Link href="/report" className="hover:text-white">
                Report a Problem
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}