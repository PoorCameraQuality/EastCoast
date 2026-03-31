import { getAllEvents } from '@/data/events'
import { BASE_URL } from '@/lib/seo'
import { venueExportType } from '@/lib/directoryExport'

function dungeonHoursSpecifications(
  hours: string | undefined
): Record<string, unknown>[] | undefined {
  if (!hours?.trim()) return undefined
  const dayMap: Record<string, string> = {
    Mo: 'Monday',
    Tu: 'Tuesday',
    We: 'Wednesday',
    Th: 'Thursday',
    Fr: 'Friday',
    Sa: 'Saturday',
    Su: 'Sunday',
  }
  const specs: Record<string, unknown>[] = []
  for (const part of hours.split(',').map((s) => s.trim())) {
    const m = part.match(/^([A-Za-z]{2})\s+(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
    if (m) {
      const dayName = dayMap[m[1] as keyof typeof dayMap] || m[1]
      specs.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayName,
        opens: `${m[2]}:${m[3]}`,
        closes: `${m[4]}:${m[5]}`,
      })
    }
  }
  return specs.length ? specs : undefined
}

function additionalTypeUriForDungeon(category: string): string {
  const t = venueExportType(category || '')
  if (t === 'swing_club') return `${BASE_URL}/schema/SwingClub`
  if (t === 'other_venue') return `${BASE_URL}/schema/CommunityVenue`
  return `${BASE_URL}/schema/BdsmDungeon`
}

function serviceLabelForDungeon(category: string): string {
  const t = venueExportType(category || '')
  if (t === 'swing_club') return 'Swing and lifestyle club'
  if (t === 'other_venue') return 'Kink-positive community venue'
  return 'BDSM community dungeon'
}

/** Remove undefined keys so JSON-LD validators see a clean graph. */
function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = pruneUndefined(v as Record<string, unknown>)
      if (Object.keys(inner).length) out[k] = inner
      continue
    }
    if (Array.isArray(v)) {
      const arr = v
        .map((item) =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? pruneUndefined(item as Record<string, unknown>)
            : item
        )
        .filter((item) => item !== undefined && item !== null)
      if (arr.length) out[k] = arr
      continue
    }
    out[k] = v
  }
  return out as T
}

interface EventStructuredDataProps {
  event: {
    name: string
    slug: string
    date: {
      start: string
      end: string
      display: string
    }
    location: {
      city: string
      state: string
      region: string
    }
    excerpt: string
    website: string
    logo?: string
    category: string
    organizer?: string
    seo?: {
      title: string
      description: string
      keywords: string
    }
  }
}

// Helper function to safely escape HTML in JSON
function escapeHtmlInJson(data: any): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

// Encode path segments for valid URLs (handles spaces, special chars)
function encodeUrlPath(path: string): string {
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/')
}

function buildImageUrl(logo: string | null | undefined, fallback: string): string[] {
  if (!logo) return [fallback]
  const fullUrl = logo.startsWith('http') ? logo : `${BASE_URL}${encodeUrlPath(logo)}`
  return [fullUrl]
}

export function EventStructuredData({ event }: EventStructuredDataProps) {
  // Determine country code (support US/CA based on state/region hints)
  const addressCountry = ((): string => {
    const state = (event.location.state || '').toUpperCase()
    const region = (event.location.region || '').toLowerCase()
    if (state === 'ON' || region.includes('canada')) return 'CA'
    return 'US'
  })()

  // Enhanced structured data for Google Rich Results with all required fields
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": (event as any).longDescription || event.excerpt,
    "startDate": event.date.start,
    "endDate": event.date.end,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": `${event.location.city}, ${event.location.state}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.location.city,
        "addressRegion": event.location.state,
        "addressCountry": addressCountry
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer || "East Coast Kink Events",
      "url": event.website || BASE_URL
    },
    "url": `${BASE_URL}/events/${event.slug}`,
    "image": buildImageUrl(event.logo, `${BASE_URL}/images/placeholder-logo.svg`),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/events/${event.slug}`
    },
    "inLanguage": "en-US",
    "isAccessibleForFree": false,
    "keywords": event.seo?.keywords || `${event.category}, ${event.location.city}, ${event.location.state}`,
    "genre": event.category,
    "offers": {
      "@type": "Offer",
      "url": event.website || `${BASE_URL}/events/${event.slug}`,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": event.date.start,
      "description": "Tickets and pricing on the organizer website"
    },
    "potentialAction": {
      "@type": "ViewAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": event.website || `${BASE_URL}/events/${event.slug}`
      }
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id={`event-structured-data-${event.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in EventStructuredData:', error)
    return null
  }
}

// New component for dungeon structured data with LocalBusiness schema
export function DungeonStructuredData({ dungeon }: { dungeon: any }) {
  const pageId = `${BASE_URL}/dungeons/${dungeon.slug}`
  const cat = dungeon.category || ''
  const hoursSpec = dungeonHoursSpecifications(dungeon.hours)
  const street = dungeon.location?.address

  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressLocality: dungeon.location.city,
    addressRegion: dungeon.location.state,
    addressCountry: 'US',
  }
  if (street) {
    address.streetAddress = street
  }

  const raw: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EntertainmentBusiness',
    name: dungeon.name,
    description: dungeon.excerpt,
    url: pageId,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageId,
    },
    additionalType: additionalTypeUriForDungeon(cat),
    image: dungeon.logo ? buildImageUrl(dungeon.logo, `${BASE_URL}/images/placeholder-logo.svg`) : undefined,
    telephone: dungeon.contact?.phone || dungeon.phone || undefined,
    email: dungeon.contact?.email || dungeon.email || undefined,
    address,
    priceRange: dungeon.priceRange || '$$',
    category: cat,
    serviceType: serviceLabelForDungeon(cat),
    areaServed: dungeon.location.region || dungeon.location.state,
    sameAs: (() => {
      if (!dungeon.socialMedia) return undefined
      const urls = Object.values(dungeon.socialMedia).filter(Boolean) as string[]
      return urls.length ? urls : undefined
    })(),
  }

  if (dungeon.location.coordinates?.lat != null && dungeon.location.coordinates?.lng != null) {
    raw.geo = {
      '@type': 'GeoCoordinates',
      latitude: dungeon.location.coordinates.lat,
      longitude: dungeon.location.coordinates.lng,
    }
  }

  if (hoursSpec) {
    raw.openingHoursSpecification = hoursSpec
  } else if (dungeon.hours) {
    raw.openingHours = dungeon.hours
  }

  const serviceList = Array.isArray(dungeon.services)
    ? dungeon.services.map((service: string) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
        },
      }))
    : []
  if (serviceList.length) {
    raw.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Listed services and programming',
      itemListElement: serviceList,
    }
  }

  const structuredData = pruneUndefined(raw as Record<string, unknown>)

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id={`dungeon-structured-data-${dungeon.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in DungeonStructuredData:', error)
    return null
  }
}

function vendorSchemaDescription(vendor: { description?: string; story?: string; seoDescription?: string }) {
  const primary = (vendor.seoDescription || vendor.description || '').trim()
  if (primary.length >= 120) return primary
  const story = (vendor.story || '').trim()
  const combined = `${primary} ${story}`.trim()
  return combined.length > 320 ? `${combined.slice(0, 317)}…` : combined || 'Vendor listing'
}

function vendorLocationLooksOnlineOnly(location?: string) {
  if (!location?.trim()) return true
  return /^online(\s|•|$)/i.test(location.trim())
}

/**
 * Vendor structured data: OnlineStore when location is online-only; otherwise LocalBusiness with address hint.
 */
export function VendorStructuredData({ vendor }: { vendor: any }) {
  const rawLogoUrl = vendor.logo125Url
  const logoUrl = rawLogoUrl
    ? rawLogoUrl.startsWith('http')
      ? rawLogoUrl
      : `${BASE_URL}${encodeUrlPath(rawLogoUrl)}`
    : undefined

  const onlineOnly = vendorLocationLooksOnlineOnly(vendor.location)
  const description = vendorSchemaDescription(vendor)

  const structuredData = onlineOnly
    ? {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "name": vendor.name,
        "description": description,
        "url": `${BASE_URL}/vendors/${vendor.slug}`,
        "image": logoUrl ? [logoUrl] : undefined,
        "sameAs": vendor.websiteUrl ? [vendor.websiteUrl] : undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": vendor.name,
        "description": description,
        "url": `${BASE_URL}/vendors/${vendor.slug}`,
        "image": logoUrl ? [logoUrl] : undefined,
        "address": vendor.location
          ? {
              "@type": "PostalAddress",
              "addressLocality": vendor.location,
              "addressCountry": "US",
            }
          : undefined,
        "sameAs": vendor.websiteUrl ? [vendor.websiteUrl] : undefined,
      }

  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id={`vendor-structured-data-${vendor.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in VendorStructuredData:', error)
    return null
  }
}

export function VendorsIndexStructuredData({
  vendors,
}: {
  vendors: { name: string; slug: string }[]
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kink vendors and BDSM gear makers",
    "numberOfItems": vendors.length,
    "itemListElement": vendors.map((v, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": v.name,
      "url": `${BASE_URL}/vendors/${v.slug}`,
    })),
  }

  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="vendors-index-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in VendorsIndexStructuredData:', error)
    return null
  }
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "East Coast Kink Events",
    "alternateName": "ECKE",
    "description": "Directory of BDSM community dungeons, swing and lifestyle clubs, kink events, education, and vendors—United States focus with expandable regional coverage.",
    "url": BASE_URL,
    // SearchAction removed until a public search query param route is provided
    "publisher": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "alternateName": "ECKE",
      "url": BASE_URL
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in WebsiteStructuredData:', error)
    return null
  }
}

// New component for enhanced event listing page
export function EventListStructuredData() {
  const events = getAllEvents()
    .filter(e => new Date(e.date.end) >= new Date())
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
    .slice(0, 10)

  const itemListElement = events.map((e, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Event",
      name: e.name,
      url: `https://www.eastcoastkinkevents.com/events/${e.slug}`
    }
  }))

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "East Coast Kink Events",
    "description": "Browse all upcoming kink events across the East Coast",
    "url": `${BASE_URL}/events`,
    "numberOfItems": itemListElement.length,
    "itemListElement": itemListElement
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="event-list-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in EventListStructuredData:', error)
    return null
  }
}

// New component for organization structured data
export function OrganizationStructuredData() {
  const sameAs = [
    "https://discord.gg/xcnGGyGsmT",
    ...(process.env.NEXT_PUBLIC_TWITTER_URL ? [process.env.NEXT_PUBLIC_TWITTER_URL] : []),
    ...(process.env.NEXT_PUBLIC_INSTAGRAM_URL ? [process.env.NEXT_PUBLIC_INSTAGRAM_URL] : []),
  ].filter(Boolean)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "East Coast Kink Events",
    "alternateName": "ECKE",
    "description": "The East Coast Kink Events (ECKE) directory lists permanent community venues (BDSM dungeons and swing/lifestyle clubs), major kink events, education, and vendors—built for discoverability and safety-forward discovery.",
    "url": BASE_URL,
    "logo": `${BASE_URL}/og-image.png`,
    "sameAs": sameAs,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": `${BASE_URL}/contact`,
      "availableLanguage": "English"
    },
    "areaServed": {
      "@type": "Place",
      "name": "United States"
    },
    "serviceType": "Event Aggregation",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Kink Events",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Event Listings",
            "description": "Browse and discover kink events across the East Coast"
          }
        }
      ]
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in OrganizationStructuredData:', error)
    return null
  }
}

export function FaqStructuredData({
  faqs,
  id = 'faq-structured-data',
}: {
  faqs: { question: string; answer: string }[]
  id?: string
}) {
  if (!faqs?.length) return null
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id={id}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in FaqStructuredData:', error)
    return null
  }
}

// New component for calendar page structured data
export function CalendarStructuredData() {
  const events = getAllEvents()
    .filter(e => new Date(e.date.end) >= new Date())
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
    .slice(0, 10)

  const itemListElement = events.map((e, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Event",
      name: e.name,
      url: `https://www.eastcoastkinkevents.com/events/${e.slug}`
    }
  }))

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Event Calendar - East Coast Kink Events",
    "description": "Browse upcoming kink events by month with our interactive calendar. Find BDSM events, conferences, and workshops across the East Coast.",
    "url": `${BASE_URL}/calendar`,
    "mainEntity": {
      "@type": "ItemList",
      "name": "East Coast Kink Events Calendar",
      "description": "Monthly calendar of kink events across the East Coast",
      "numberOfItems": itemListElement.length,
      "itemListElement": itemListElement
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="calendar-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in CalendarStructuredData:', error)
    return null
  }
}

// New component for contact page structured data
export function ContactPageStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us - East Coast Kink Events",
    "description": "Get in touch with East Coast Kink Events. Add your event or dungeon, provide feedback, or contact site administration.",
    "url": `${BASE_URL}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "sh.kinney@hotmail.com",
        "availableLanguage": "English"
      }
    },
    "potentialAction": {
      "@type": "CommunicateAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/contact`
      }
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="contact-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in ContactPageStructuredData:', error)
    return null
  }
}

// New component for education page structured data
interface ArticleForSchema {
  slug: string
  title: string
  author_name?: string
}

export function EducationStructuredData({ articles = [] }: { articles?: ArticleForSchema[] }) {
  const itemListElement = articles.map((article, idx) => ({
    "@type": "ListItem" as const,
    position: idx + 1,
    item: {
      "@type": "Article" as const,
      name: article.title,
      url: `${BASE_URL}/education/${article.slug}`,
      ...(article.author_name && {
        author: {
          "@type": "Person" as const,
          name: article.author_name
        }
      }),
      publisher: {
        "@type": "Organization" as const,
        name: "East Coast Kink Events"
      }
    }
  }))

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Kink Education - East Coast Kink Events",
    "description": "Comprehensive kink education resources including safety guides, negotiation techniques, aftercare essentials, and community guidelines for responsible BDSM practice.",
    "url": `${BASE_URL}/education`,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Kink Education Articles",
      "description": "Educational articles and resources for the kink community",
      "numberOfItems": itemListElement.length,
      "itemListElement": itemListElement
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="education-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in EducationStructuredData:', error)
    return null
  }
}

// New component for homepage structured data
export function HomepageStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "East Coast Kink Events - Discover BDSM Events & Dungeons",
    "description": "Plan kink and BDSM events, dungeons, vendors, and education across the United States—all 50 states and growing. East Coast roots with nationwide listings.",
    "url": BASE_URL,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Featured Kink Events",
      "description": "Upcoming kink events and directory hubs across the United States",
      "numberOfItems": 5,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Service",
            "name": "Event Discovery",
            "description": "Browse and discover kink events nationwide"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Service",
            "name": "Dungeon Directory",
            "description": "Find BDSM dungeons and play spaces"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Service",
            "name": "Educational Resources",
            "description": "Learn about kink safety and community guidelines"
          }
        },
        {
          "@type": "ListItem",
          "position": 4,
          "item": {
            "@type": "Service",
            "name": "Community Connection",
            "description": "Connect with the kink community through Discord"
          }
        },
        {
          "@type": "ListItem",
          "position": 5,
          "item": {
            "@type": "Service",
            "name": "Event Submission",
            "description": "Submit your event or dungeon for listing"
          }
        }
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "url": "https://www.eastcoastkinkevents.com"
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in HomepageStructuredData:', error)
    return null
  }
}

