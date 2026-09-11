/** Site-wide sponsor spotlight (replaces monthly vendor sponsor when set). */

import { eventSlugFromInternalHref } from '@/lib/publicEventIndex'

export type SiteSponsorPromo = {
  name: string
  eyebrow: string
  headline: string
  tagline: string
  imageUrl: string
  imageAlt: string
  /** ECKE listing path, e.g. `/events/grand-strand-affair-2026` */
  href: string
  ctaLabel: string
  /** Official organizer site — used by “View this event” when set. */
  websiteUrl?: string
}

/** Set to `null` to fall back to `SITE_SPONSOR_VENDOR_SLUG` in vendors.js */
export const SITE_SPONSOR_PROMO: SiteSponsorPromo | null = {
  name: 'Grand Strand Affair',
  eyebrow: 'Site sponsor',
  headline: 'Grand Strand Affair 2026',
  tagline:
    'Supporting East Coast Kink Events. First-year educational weekend in Myrtle Beach, November 19–22.',
  imageUrl: '/images/events/brand-grand-strand-affair.png',
  imageAlt: 'Grand Strand Affair logo',
  href: '/events/grand-strand-affair-2026',
  ctaLabel: 'View listing',
  websiteUrl: 'https://grandstrandaffair.com/',
}

export function getSiteSponsorPromo(): SiteSponsorPromo | null {
  return SITE_SPONSOR_PROMO
}

/** True when this event slug is the active site-wide sponsor listing. */
export function isSiteSponsorEventSlug(slug: string | null | undefined): boolean {
  const sponsorSlug = eventSlugFromInternalHref(getSiteSponsorPromo()?.href)
  if (!sponsorSlug || !slug) return false
  return slug.trim().toLowerCase() === sponsorSlug
}
