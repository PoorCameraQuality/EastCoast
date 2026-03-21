import { getAllEvents } from '@/data/events'
import { BASE_URL } from '@/lib/seo'

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
    logo: string
    category: string
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
      "name": "East Coast Kink Events",
      "url": BASE_URL
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
      "url": event.website,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": event.date.start
    },
    "performer": {
      "@type": "Organization",
      "name": event.name,
      "url": event.website
    },
    "potentialAction": {
      "@type": "ViewAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": event.website
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": dungeon.name,
    "description": dungeon.excerpt,
    "url": `${BASE_URL}/dungeons/${dungeon.slug}`,
    "image": dungeon.logo ? buildImageUrl(dungeon.logo, `${BASE_URL}/images/placeholder-logo.svg`) : undefined,
    "telephone": dungeon.contact?.phone || dungeon.phone || undefined,
    "email": dungeon.contact?.email || dungeon.email || undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": dungeon.location.city,
      "addressRegion": dungeon.location.state,
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": dungeon.location.coordinates?.lat || undefined,
      "longitude": dungeon.location.coordinates?.lng || undefined
    },
    "openingHours": dungeon.hours || undefined,
    "priceRange": dungeon.priceRange || "$$",
    "category": dungeon.category,
    "serviceType": "BDSM Dungeon",
    "areaServed": dungeon.location.region || dungeon.location.state,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Dungeon Services",
      "itemListElement": dungeon.services?.map((service: string, index: number) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      })) || []
    },
    "sameAs": dungeon.socialMedia ? Object.values(dungeon.socialMedia) : undefined
  }

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

/**
 * Vendor structured data using LocalBusiness schema.
 */
export function VendorStructuredData({ vendor }: { vendor: any }) {
  const rawLogoUrl = vendor.logo125Url
  const logoUrl = rawLogoUrl
    ? rawLogoUrl.startsWith('http')
      ? rawLogoUrl
      : `${BASE_URL}${encodeUrlPath(rawLogoUrl)}`
    : undefined

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": vendor.name,
    "description": vendor.description || vendor.story || 'Vendor listing',
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

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "East Coast Kink Events",
    "description": "Discover and connect with kink events across the East Coast",
    "url": "https://www.eastcoastkinkevents.com",
    // SearchAction removed until a public search query param route is provided
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "East Coast Kink Events",
    "description": "Discover and connect with kink events across the East Coast",
    "url": BASE_URL,
    "logo": `${BASE_URL}/images/placeholder-logo.svg`,
    "sameAs": [
      "https://discord.gg/xcnGGyGsmT"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": `${BASE_URL}/contact`,
      "availableLanguage": "English"
    },
    "areaServed": {
      "@type": "Place",
      "name": "East Coast United States"
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
  const itemListElement = articles.slice(0, 50).map((article, idx) => ({
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
    "description": "Find kink events, BDSM dungeons, and educational resources across the East Coast. Connect with workshops, conferences, and community events in a safe, inclusive environment.",
    "url": BASE_URL,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Featured Kink Events",
      "description": "Upcoming kink events across the East Coast",
      "numberOfItems": 5,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Service",
            "name": "Event Discovery",
            "description": "Browse and discover kink events across the East Coast"
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

// New component for individual article structured data
interface ArticleStructuredDataProps {
  article: {
    title: string
    slug: string
    excerpt: string
    author_name: string
    author_credentials?: string
    created_at?: string
    category: string
    tags?: string[]
  }
}

export function ArticleStructuredData({ article }: { article: any }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    ...(article?.content ? { "articleBody": article.content } : {}),
    "author": {
      "@type": "Person",
      "name": article.author_name,
      "jobTitle": article.author_credentials
    },
    "publisher": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "url": "https://www.eastcoastkinkevents.com"
    },
    "datePublished": article.created_at || new Date().toISOString(),
    "dateModified": article.created_at || new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.eastcoastkinkevents.com/education/${article.slug}`
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://www.eastcoastkinkevents.com/images/education-default.jpg"
    }
  }

  // Validate JSON before injecting
  try {
    const jsonString = escapeHtmlInJson(structuredData)
    return (
      <script
        id={`article-structured-data-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    )
  } catch (error) {
    console.error('Invalid JSON in ArticleStructuredData:', error)
    return null
  }
}
