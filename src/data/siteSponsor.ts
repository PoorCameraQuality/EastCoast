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
  name: 'kink.social',
  eyebrow: 'Sponsor spotlight',
  headline: 'Alpha test is live',
  tagline: 'Build community, organize events, make friends.',
  imageUrl: '/images/sponsors/kink-social-alpha-test.png',
  imageAlt: 'kink.social alpha test — gold KS monogram on black',
  href: 'https://kink.social',
  ctaLabel: 'Join the alpha',
}

export function getSiteSponsorPromo(): SiteSponsorPromo | null {
  return SITE_SPONSOR_PROMO
}
