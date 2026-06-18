/**
 * Central kink.social acquisition URLs and copy for ECKE public SEO surfaces.
 * All outbound kink.social links should go through these helpers (UTM + safe paths).
 */

export const KINK_SOCIAL_BASE_URL = (
  process.env.NEXT_PUBLIC_C2K_PUBLIC_URL?.trim() || 'https://kink.social'
).replace(/\/$/, '')

export const KINK_SOCIAL_UTM = {
  source: 'ecke',
  medium: 'seo_cta',
  campaign: 'kink_social_alpha',
} as const

export type KinkSocialCampaign =
  | 'home_platform'
  | 'event_detail'
  | 'events_index'
  | 'calendar'
  | 'state_page'
  | 'dungeon_page'
  | 'vendor_page'
  | 'education_article'
  | 'dancecard'
  | 'organizer'
  | 'footer'
  | 'header_nav'

export type KinkSocialAcquisitionVariant =
  | 'home'
  | 'eventDetail'
  | 'c2kEventDetail'
  | 'eventsIndex'
  | 'calendar'
  | 'state'
  | 'dungeon'
  | 'vendor'
  | 'education'
  | 'dancecard'
  | 'organizer'
  | 'footer'

/** Public kink.social paths verified against kink.social web routes. */
export const KINK_SOCIAL_PATHS = {
  join: '/',
  orgNew: '/orgs/new',
  vendorOnboarding: '/vendors/onboarding',
  eventsBrowse: '/events',
  educationBrowse: '/education',
} as const

export const KINK_SOCIAL_LABELS = {
  joinFree: 'Join kink.social free',
  createOrg: 'Create a free organization',
  createVendorProfile: 'Create vendor profile',
  browseEvents: 'Browse more events',
  exploreEducation: 'Explore education',
  listEvent: 'List an event',
  exploreDancecard: 'Explore Dancecard',
  exploreDancecardByKs: 'Explore Dancecard by kink.social',
  publishToEcke: 'Publish to ECKE from kink.social',
} as const

export const KINK_SOCIAL_FRIENDLY_ALTERNATIVE_NOTE =
  'kink.social is a modern alternative to old-school kink social networks, built around events, education, organizers, groups, vendors, and real-world community.'

export const KINK_SOCIAL_PLATFORM_FAQ = [
  {
    question: 'Is kink.social a FetLife alternative?',
    answer:
      'Yes, in the friendly sense. kink.social is a free kink community platform for people who want a modern layer around events, organizers, groups, education, vendors, presenters, conventions, and real-world connection. FetLife helped shape online kink community. kink.social is being built for what comes next.',
  },
  {
    question: 'Why are ECKE and kink.social separate?',
    answer:
      'ECKE is public and searchable, so people can find events, venues, vendors, and education. kink.social is the account-based platform where people save events, follow organizers, build profiles, manage organizations, and use community tools.',
  },
  {
    question: 'Is kink.social free?',
    answer: 'Yes. kink.social is free to join, and organizations can get started for free.',
  },
] as const

const VARIANT_CAMPAIGN: Record<KinkSocialAcquisitionVariant, KinkSocialCampaign> = {
  home: 'home_platform',
  eventDetail: 'event_detail',
  c2kEventDetail: 'event_detail',
  eventsIndex: 'events_index',
  calendar: 'calendar',
  state: 'state_page',
  dungeon: 'dungeon_page',
  vendor: 'vendor_page',
  education: 'education_article',
  dancecard: 'dancecard',
  organizer: 'organizer',
  footer: 'footer',
}

export function campaignForVariant(variant: KinkSocialAcquisitionVariant): KinkSocialCampaign {
  return VARIANT_CAMPAIGN[variant]
}

export function buildKinkSocialUrl(
  path: string,
  campaign: KinkSocialCampaign,
  extraParams?: Record<string, string | undefined>,
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${KINK_SOCIAL_BASE_URL}${normalizedPath}`)
  url.searchParams.set('utm_source', KINK_SOCIAL_UTM.source)
  url.searchParams.set('utm_medium', KINK_SOCIAL_UTM.medium)
  url.searchParams.set('utm_campaign', KINK_SOCIAL_UTM.campaign)
  url.searchParams.set('utm_content', campaign)
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) url.searchParams.set(key, value)
    }
  }
  return url.toString()
}

export function getKinkSocialJoinUrl(campaign: KinkSocialCampaign): string {
  return buildKinkSocialUrl(KINK_SOCIAL_PATHS.join, campaign)
}

export function getKinkSocialOrgUrl(campaign: KinkSocialCampaign): string {
  return buildKinkSocialUrl(KINK_SOCIAL_PATHS.orgNew, campaign)
}

export function getKinkSocialVendorOnboardingUrl(campaign: KinkSocialCampaign): string {
  return buildKinkSocialUrl(KINK_SOCIAL_PATHS.vendorOnboarding, campaign)
}

export type AcquisitionCopy = {
  eyebrow: string
  heading: string
  body: string
  bullets: string[]
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
  tertiaryLabel?: string
  tertiaryHref?: string
  footnote?: string
  showFaq?: boolean
}

type CopyContext = {
  stateName?: string
  eventSlug?: string
  organizerName?: string
  safeKinkSocialEventUrl?: string | null
}

export function getAcquisitionCopy(
  variant: KinkSocialAcquisitionVariant,
  context: CopyContext = {},
): AcquisitionCopy {
  const campaign = campaignForVariant(variant)
  const join = getKinkSocialJoinUrl(campaign)
  const org = getKinkSocialOrgUrl(campaign)
  const vendor = getKinkSocialVendorOnboardingUrl(campaign)

  switch (variant) {
    case 'home':
      return {
        eyebrow: 'FREE TO JOIN ON KINK.SOCIAL',
        heading: 'Found the event? Join the community around it.',
        body:
          'East Coast Kink Events helps you discover public events, venues, vendors, and education. kink.social is where you save events, follow organizers, build your profile, use Dancecard, and connect with the real community behind the listing.',
        bullets: [
          'Save events and follow organizers',
          'Build a kink-aware profile on your terms',
          'Use Dancecard at supported events and conventions',
          'Connect with groups, presenters, educators, vendors, and organizers',
          'Create free organizations and publish public listings to ECKE',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.createOrg,
        secondaryHref: org,
        tertiaryLabel: KINK_SOCIAL_LABELS.exploreDancecardByKs,
        tertiaryHref: '/dancecard',
        footnote: KINK_SOCIAL_FRIENDLY_ALTERNATIVE_NOTE,
        showFaq: true,
      }
    case 'c2kEventDetail':
      return {
        eyebrow: 'PUBLISHED FROM KINK.SOCIAL',
        heading: 'This listing is powered by kink.social',
        body:
          'Organizers can manage their event in one place, then publish the public version to East Coast Kink Events for search and discovery.',
        bullets: [
          'Save this event',
          'Follow the organizer',
          'Use Dancecard when available',
          'Get updates in one place',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.createOrg,
        secondaryHref: org,
        tertiaryLabel: context.safeKinkSocialEventUrl ? 'View on kink.social' : undefined,
        tertiaryHref: context.safeKinkSocialEventUrl ?? undefined,
        footnote: 'ECKE is the public listing. kink.social is where the community tools live.',
      }
    case 'eventDetail':
      return {
        eyebrow: 'ON KINK.SOCIAL',
        heading: 'Going to this event?',
        body:
          'Join kink.social free to save events, follow organizers, build your profile, and manage your weekend when Dancecard is enabled.',
        bullets: [
          'Save this event',
          'Follow the organizer',
          'Use Dancecard when available',
          'Get updates in one place',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.browseEvents,
        secondaryHref: '/events',
        footnote: 'ECKE is the public listing. kink.social is where the community tools live.',
      }
    case 'eventsIndex':
      return {
        eyebrow: 'MAKE THIS CALENDAR YOURS',
        heading: 'Save events. Follow organizers. Build your kink community.',
        body:
          'ECKE helps you find what is public. kink.social helps you keep track of the events, people, organizers, groups, and education that matter to you.',
        bullets: [
          'Save events you care about',
          'Follow organizers and groups',
          'Build a profile on your terms',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.createOrg,
        secondaryHref: org,
      }
    case 'calendar':
      return getAcquisitionCopy('eventsIndex', context)
    case 'state':
      return {
        eyebrow: 'LOCAL COMMUNITY',
        heading: context.stateName ? `Find your local kink community in ${context.stateName}.` : 'Find your local kink community.',
        body:
          'Browse public listings here, then join kink.social free to follow organizers, groups, presenters, vendors, educators, and events near you.',
        bullets: [
          'Follow local organizers and groups',
          'Save events near you',
          'Connect with educators and vendors',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.listEvent,
        secondaryHref: org,
      }
    case 'dungeon':
      return {
        eyebrow: 'FOR VENUES AND CLUBS',
        heading: 'Help people follow what happens here.',
        body:
          'Create a free kink.social organization page to manage your public presence, publish events to ECKE, and keep community updates connected in one place.',
        bullets: [
          'Publish public events to ECKE',
          'Manage your organization profile',
          'Connect schedules and community updates',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.createOrg,
        primaryHref: org,
        secondaryLabel: KINK_SOCIAL_LABELS.joinFree,
        secondaryHref: join,
        footnote: 'Organization pages require a kink.social account. Contact us if you need help getting started.',
      }
    case 'vendor':
      return {
        eyebrow: 'FOR VENDORS',
        heading: 'Get found where kink events happen.',
        body:
          'Create a kink.social vendor profile so organizers and attendees can discover you across events, conventions, and public ECKE listings.',
        bullets: [
          'Show up where organizers plan events',
          'Connect your work to conventions and nights',
          'Build a public-facing vendor presence',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.createVendorProfile,
        secondaryHref: vendor,
        footnote: 'kink.social does not process ticket sales or checkout on ECKE.',
      }
    case 'education':
      return {
        eyebrow: 'KEEP LEARNING ON KINK.SOCIAL',
        heading: 'Want more than one article?',
        body:
          'Join kink.social free to follow educators, publish your own writing, build learning paths, and connect education to presenter profiles, events, and real community work.',
        bullets: [
          'Follow educators and presenters',
          'Publish with community moderation',
          'Connect articles to events and profiles',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.exploreEducation,
        secondaryHref: '/education',
        footnote: 'Public ECKE publishing follows moderation and eligibility rules on kink.social.',
      }
    case 'dancecard':
      return {
        eyebrow: 'DANCECARD BY KINK.SOCIAL',
        heading: 'Your weekend, planned your way.',
        body:
          'Dancecard is the schedule and weekend-planning layer inside kink.social. Browse the live program, compare free time, build your personal schedule, and help organizers run smoother events.',
        bullets: [
          'Personal schedule for supported events',
          'Compare free time with friends',
          'Live program on your phone',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.exploreDancecard,
        primaryHref: '/dancecard',
        secondaryLabel: KINK_SOCIAL_LABELS.joinFree,
        secondaryHref: join,
      }
    case 'organizer':
      return {
        eyebrow: 'FOR ORGANIZERS',
        heading: 'Run your event on kink.social. Promote it on ECKE.',
        body:
          'Create a free kink.social organization to manage events, conventions, staff, presenters, vendors, schedules, and public ECKE listings from one place.',
        bullets: [
          'Events, conventions, and recurring nights',
          'Staff, volunteers, presenters, and vendors',
          'Dancecard schedules and weekend planning',
          'Public listings published to ECKE',
          'A public presence people can follow',
        ],
        primaryLabel: KINK_SOCIAL_LABELS.createOrg,
        primaryHref: org,
        secondaryLabel: KINK_SOCIAL_LABELS.joinFree,
        secondaryHref: join,
      }
    case 'footer':
      return {
        eyebrow: 'KINK.SOCIAL',
        heading: 'Discover on ECKE. Join on kink.social.',
        body:
          'East Coast Kink Events is the public searchable directory. kink.social is the free community and event management platform behind the scenes.',
        bullets: [],
        primaryLabel: KINK_SOCIAL_LABELS.joinFree,
        primaryHref: join,
        secondaryLabel: KINK_SOCIAL_LABELS.createOrg,
        secondaryHref: org,
      }
    default:
      return getAcquisitionCopy('home', context)
  }
}

export const KINK_SOCIAL_CTA_ANALYTICS_EVENT = 'ecke_kink_social_cta_click'
