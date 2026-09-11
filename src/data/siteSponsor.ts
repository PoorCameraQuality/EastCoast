/** Site-wide sponsor spotlight (replaces monthly vendor sponsor when set). */

export type SiteSponsorPromo = {
  name: string
  eyebrow: string
  headline: string
  tagline: string
  imageUrl: string
  imageAlt: string
  href: string
  ctaLabel: string
}

/** Set to `null` to fall back to `SITE_SPONSOR_VENDOR_SLUG` in vendors.js */
export const SITE_SPONSOR_PROMO: SiteSponsorPromo | null = {
  name: 'Grand Strand Affair',
  eyebrow: 'Featured sponsor',
  headline: 'Grand Strand Affair 2026',
  tagline: 'First-year educational weekend in Myrtle Beach, November 19–22.',
  imageUrl: '/images/events/brand-grand-strand-affair.png',
  imageAlt: 'Grand Strand Affair logo',
  href: '/events/grand-strand-affair-2026',
  ctaLabel: 'View listing',
}

export function getSiteSponsorPromo(): SiteSponsorPromo | null {
  return SITE_SPONSOR_PROMO
}
