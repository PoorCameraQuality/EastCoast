import Script from 'next/script'

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

export function EventStructuredData({ event }: EventStructuredDataProps) {
  // Enhanced structured data for Google Rich Results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.excerpt,
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
        "addressCountry": "US"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "url": "https://eastcoastkinkevents.com"
    },
    "performer": {
      "@type": "Organization",
      "name": "East Coast Kink Events"
    },
    "url": `https://eastcoastkinkevents.com/events/${event.slug}`,
    "image": event.logo ? `https://eastcoastkinkevents.com${event.logo}` : undefined,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://eastcoastkinkevents.com/events/${event.slug}`
    },
    "offers": {
      "@type": "Offer",
      "url": event.website,
      "availability": "https://schema.org/InStock",
      "validFrom": event.date.start,
      "priceCurrency": "USD",
      "price": "0",
      "priceValidUntil": event.date.end
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Adults 18+"
    },
    "inLanguage": "en-US",
    "isAccessibleForFree": false,
    "maximumAttendeeCapacity": 100,
    "remainingAttendeeCapacity": 50,
    "typicalAgeRange": "18-99",
    "keywords": event.seo?.keywords || `${event.category}, ${event.location.city}, ${event.location.state}`,
    "genre": event.category,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Event Type",
        "value": event.category
      },
      {
        "@type": "PropertyValue", 
        "name": "Region",
        "value": event.location.region
      },
      {
        "@type": "PropertyValue",
        "name": "Event Category",
        "value": event.category
      }
    ],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": event.website
      }
    }
  }

  return (
    <Script
      id={`event-structured-data-${event.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface DungeonStructuredDataProps {
  dungeon: {
    name: string
    slug: string
    excerpt: string
    website: string
    logo: string
    location: {
      city: string
      state: string
    }
  }
}

export function DungeonStructuredData({ dungeon }: DungeonStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": dungeon.name,
    "description": dungeon.excerpt,
    "url": `https://eastcoastkinkevents.com/dungeons/${dungeon.slug}`,
    "image": dungeon.logo ? `https://eastcoastkinkevents.com${dungeon.logo}` : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": dungeon.location.city,
      "addressRegion": dungeon.location.state,
      "addressCountry": "US"
    },
    "sameAs": dungeon.website,
    "serviceType": "BDSM Dungeon",
    "areaServed": {
      "@type": "State",
      "name": dungeon.location.state
    }
  }

  return (
    <Script
      id={`dungeon-structured-data-${dungeon.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "East Coast Kink Events",
    "description": "Discover and connect with kink events across the East Coast",
    "url": "https://eastcoastkinkevents.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://eastcoastkinkevents.com/events?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "url": "https://eastcoastkinkevents.com"
    }
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// New component for enhanced event listing page
export function EventListStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "East Coast Kink Events",
    "description": "Browse all upcoming kink events across the East Coast",
    "url": "https://eastcoastkinkevents.com/events",
    "numberOfItems": 10,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Event",
          "name": "The Summer Michigan Rope Conference SMIRC",
          "url": "https://eastcoastkinkevents.com/events/summer-michigan-rope-conference-smirc"
        }
      }
    ]
  }

  return (
    <Script
      id="event-list-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// New component for organization structured data
export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "East Coast Kink Events",
    "description": "Discover and connect with kink events across the East Coast",
    "url": "https://eastcoastkinkevents.com",
    "logo": "https://eastcoastkinkevents.com/logo.png",
    "sameAs": [
      "https://discord.gg/xcnGGyGsmT"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "sh.kinney@hotmail.com"
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

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// New component for calendar page structured data
export function CalendarStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Event Calendar - East Coast Kink Events",
    "description": "Browse upcoming kink events by month with our interactive calendar. Find BDSM events, conferences, and workshops across the East Coast.",
    "url": "https://eastcoastkinkevents.com/calendar",
    "mainEntity": {
      "@type": "ItemList",
      "name": "East Coast Kink Events Calendar",
      "description": "Monthly calendar of kink events across the East Coast",
      "numberOfItems": 10,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Event",
            "name": "The Summer Michigan Rope Conference SMIRC",
            "url": "https://eastcoastkinkevents.com/events/summer-michigan-rope-conference-smirc"
          }
        }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://eastcoastkinkevents.com/calendar?month={month}",
      "query-input": "required name=month"
    }
  }

  return (
    <Script
      id="calendar-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// New component for contact page structured data
export function ContactPageStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us - East Coast Kink Events",
    "description": "Get in touch with East Coast Kink Events. Add your event or dungeon, provide feedback, or contact site administration.",
    "url": "https://eastcoastkinkevents.com/contact",
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
        "urlTemplate": "https://eastcoastkinkevents.com/contact"
      }
    }
  }

  return (
    <Script
      id="contact-page-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// New component for education page structured data
export function EducationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Kink Education - East Coast Kink Events",
    "description": "Comprehensive kink education resources including safety guides, negotiation techniques, aftercare essentials, and community guidelines for responsible BDSM practice.",
    "url": "https://eastcoastkinkevents.com/education",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Kink Education Articles",
      "description": "Educational articles and resources for the kink community",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Article",
            "name": "SSC vs RACK: Understanding Kink Safety Frameworks",
            "url": "https://eastcoastkinkevents.com/education/ssc-vs-rack-kink-safety-frameworks",
            "author": {
              "@type": "Person",
              "name": "Dr. Sarah Chen"
            },
            "publisher": {
              "@type": "Organization",
              "name": "East Coast Kink Events"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "Article",
            "name": "Negotiation 101: Building Consent in BDSM Relationships",
            "url": "https://eastcoastkinkevents.com/education/negotiation-101-building-consent-bdsm-relationships",
            "author": {
              "@type": "Person",
              "name": "Marcus Rodriguez"
            },
            "publisher": {
              "@type": "Organization",
              "name": "East Coast Kink Events"
            }
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "Article",
            "name": "Aftercare Essentials: Supporting Your Partner After Play",
            "url": "https://eastcoastkinkevents.com/education/aftercare-essentials-supporting-partner-after-play",
            "author": {
              "@type": "Person",
              "name": "Dr. Emily Watson"
            },
            "publisher": {
              "@type": "Organization",
              "name": "East Coast Kink Events"
            }
          }
        }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://eastcoastkinkevents.com/education?category={category}",
      "query-input": "required name=category"
    }
  }

  return (
    <Script
      id="education-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
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
    "articleBody": article.content,
    "author": {
      "@type": "Person",
      "name": article.author_name,
      "jobTitle": article.author_credentials
    },
    "publisher": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "url": "https://eastcoastkinkevents.com"
    },
    "datePublished": article.created_at || new Date().toISOString(),
    "dateModified": article.created_at || new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://eastcoastkinkevents.com/education/${article.id}`
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://eastcoastkinkevents.com/images/education-default.jpg"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
