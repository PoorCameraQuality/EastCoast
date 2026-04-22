/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a single trailing slash policy to avoid redirect chains
  trailingSlash: false,
  // Enable Next.js image optimization for remote logos
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.squarespace-cdn.com' },
      { protocol: 'https', hostname: 'kicevents.com' },
      { protocol: 'https', hostname: 'www.kicevents.com' },
      { protocol: 'https', hostname: 'studio58events.com' },
      { protocol: 'https', hostname: 'www.kinkdownsouth.com' },
      /** Supabase Storage (`NEXT_PUBLIC_SUPABASE_URL` host) — logos from DB */
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      /** Swing-club asset pipeline (see `asset-overrides.generated.js`) */
      { protocol: 'https', hostname: 'modernlifestyle-prod.nyc3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' },
      { protocol: 'https', hostname: 'lirp.cdn-website.com' },
    ],
  },

  env: {
    DISABLE_VERCEL_FEEDBACK: 'true'
  },

  /** If `public/*.html` is not picked up (some local setups), this still serves the preview. */
  async rewrites() {
    return [
      { source: '/c2k-brand-color-options.html', destination: '/brand-colors' },
    ]
  },
  
  // Add redirects for old URL structure to fix 404 errors
  async redirects() {
    return [
      // CRITICAL: Fix HTTP to HTTPS redirects first
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.eastcoastkinkevents.com/:path*',
        permanent: true,
      },
      // Redirect non-www to www
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'eastcoastkinkevents.com',
          },
        ],
        destination: 'https://www.eastcoastkinkevents.com/:path*',
        permanent: true,
      },

      // Normalize section roots - remove trailing slashes
      { source: '/events/', destination: '/events', permanent: true },
      { source: '/dungeons/', destination: '/dungeons', permanent: true },
      { source: '/education/', destination: '/education', permanent: true },
      { source: '/blog/', destination: '/blog', permanent: true },
      // Hub trailing slashes → canonical URLs (reduces duplicate URLs in GSC)
      { source: '/calendar/', destination: '/calendar', permanent: true },
      { source: '/states/', destination: '/states', permanent: true },
      { source: '/vendors/', destination: '/vendors', permanent: true },

      // Explicit trailing slash removal for detail pages
      { source: '/events/:slug/', destination: '/events/:slug', permanent: true },
      { source: '/dungeons/:slug/', destination: '/dungeons/:slug', permanent: true },
      { source: '/education/:slug/', destination: '/education/:slug', permanent: true },
      // Only strip trailing slash on blog article paths (never redirect to the same URL — that loops).
      { source: '/blog/:path*/', destination: '/blog/:path*', permanent: true },
      { source: '/states/:state/', destination: '/states/:state', permanent: true },
      { source: '/vendors/:slug/', destination: '/vendors/:slug', permanent: true },

      // Spirituality/kink programmatic hub superseded community-spotlight (single canonical)
      { source: '/community-spotlight', destination: '/spirituality-kink', permanent: true },

      // Event URL canonicalization: redirect year-based event slugs to year-agnostic URLs (SEO)
      { source: '/events/indy-rope-expo-2026', destination: '/events/indy-rope-expo', permanent: true },
      { source: '/events/claw-26', destination: '/events/claw', permanent: true },
      { source: '/events/imslbb-2026', destination: '/events/imslbb', permanent: true },
      { source: '/events/hugs-and-kisses-2026', destination: '/events/hugs-and-kisses', permanent: true },
      { source: '/events/tes-fest-2026', destination: '/events/tesfest', permanent: true },
      { source: '/events/tes-fest', destination: '/events/tesfest', permanent: true },
      { source: '/events/ropecraft-chicago-2026', destination: '/events/ropecraft-chicago', permanent: true },
      { source: '/events/kink-odyssey-spring-2026', destination: '/events/kink-odyssey-spring', permanent: true },
      { source: '/events/fetish-con-2026', destination: '/events/fetish-con', permanent: true },
      { source: '/events/domcon-new-orleans-2026', destination: '/events/domcon-new-orleans', permanent: true },
      { source: '/events/women-of-drummer-2026', destination: '/events/women-of-drummer', permanent: true },
      { source: '/events/maul-20th-anniversary-weekend-2026', destination: '/events/maul-20th-anniversary-weekend', permanent: true },
      { source: '/events/rehoboth-beach-leather-weekend-2025', destination: '/events/rehoboth-beach-leather-weekend', permanent: true },
      { source: '/events/nepah-2026', destination: '/events/nepah', permanent: true },
      { source: '/events/fire-island-leather-weekend-2026', destination: '/events/fire-island-leather-weekend', permanent: true },
      { source: '/events/mid-atlantic-leather-weekend-2026', destination: '/events/mid-atlantic-leather-weekend', permanent: true },
      { source: '/events/elevation-rope-2026', destination: '/events/elevation-rope', permanent: true },
      { source: '/events/cure-2026', destination: '/events/cure', permanent: true },

      // Strip AMP format parameter
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'format', value: 'amp' }],
        destination: '/:path*',
        permanent: true,
      },

      // Map category query parameters to events page
      {
        source: '/',
        has: [{ type: 'query', key: 'category', value: 'Events' }],
        destination: '/events',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'category', value: 'Indoor+Kink+Events' }],
        destination: '/events',
        permanent: true,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'category', value: 'Outdoor+Events' }],
        destination: '/events',
        permanent: true,
      },

      // Privacy URL consistency
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/privacy/', destination: '/privacy', permanent: true },
      
      // Temporary redirect for Add Event until form is built
      { source: '/events/add', destination: '/contact?subject=Event%20Submission', permanent: false },
      
      // Fix typo: costal -> coastal (must come before generic kinkeventcalendar redirect)
      {
        source: '/kinkeventcalendar/costal-carolina-fetish-fair',
        destination: '/events/coastal-carolina-fetish-fair',
        permanent: true,
      },
      // Redirect old kinkeventcalendar URLs to new events structure (catch-all for nested paths)
      {
        source: '/kinkeventcalendar/:path*',
        destination: '/events/:path*',
        permanent: true,
      },
      // kinkeducationcenter → /blog or /education (see middleware + legacyKinkEducationToBlog.ts)
      // Redirect old kinkeventcalendar base URL
      {
        source: '/kinkeventcalendar',
        destination: '/events',
        permanent: true,
      },
      // Redirect old UUID-based education URLs to their proper slugs
      {
        source: '/education/efd0f64a-9a67-4545-bf5b-80887a867b54',
        destination: '/education/ssc-vs-rack-kink-safety-frameworks',
        permanent: true,
      },
      {
        source: '/education/40d5f2b8-1186-4206-a696-6fc3f802fd5a',
        destination: '/education/negotiation-101-building-consent-bdsm-relationships',
        permanent: true,
      },
      {
        source: '/education/f1c7df53-a035-47f7-ae11-d6aac92e73aa',
        destination: '/education/aftercare-essentials-supporting-partner-after-play',
        permanent: true,
      },
      // Redirect old UUID-based education URL
      {
        source: '/education/6eb29727-42dc-4d07-8713-488ecd8276b8',
        destination: '/education/ssc-vs-rack-kink-safety-frameworks',
        permanent: true,
      },
      // Redirect non-www education URLs to www
      {
        source: '/education/aftercare-essentials-supporting-partner-after-play',
        has: [
          {
            type: 'host',
            value: 'eastcoastkinkevents.com',
          },
        ],
        destination: 'https://www.eastcoastkinkevents.com/education/aftercare-essentials-supporting-partner-after-play',
        permanent: true,
      },
      {
        source: '/education/ssc-vs-rack-kink-safety-frameworks',
        has: [
          {
            type: 'host',
            value: 'eastcoastkinkevents.com',
          },
        ],
        destination: 'https://www.eastcoastkinkevents.com/education/ssc-vs-rack-kink-safety-frameworks',
        permanent: true,
      },
      {
        source: '/education/negotiation-101-building-consent-bdsm-relationships',
        has: [
          {
            type: 'host',
            value: 'eastcoastkinkevents.com',
          },
        ],
        destination: 'https://www.eastcoastkinkevents.com/education/negotiation-101-building-consent-bdsm-relationships',
        permanent: true,
      },
      // Redirect old event URLs with year suffixes
      {
        source: '/kinkeventcalendar/campcrucible2024',
        destination: '/events/camp-crucible',
        permanent: true,
      },
      // Redirect event URLs causing soft 404s
      {
        source: '/kinkeventcalendar/tethered-together',
        destination: '/events/tethered-together',
        permanent: true,
      },
      {
        source: '/kinkeventcalendar/summercamp',
        destination: '/events/dark-odyssey-summer-camp',
        permanent: true,
      },
      {
        source: '/kinkeventcalendar/dungeons-and-geekdoms',
        destination: '/events/dungeons-geekdoms',
        permanent: true,
      },
      // Redirect old dungeon URLs (trailingSlash: false handles / automatically)
      {
        source: '/dungeons/ascendcommunity/:path*',
        destination: '/dungeons/ascend-community',
        permanent: true,
      },
      {
        source: '/dungeons/theowlsnest/:path*',
        destination: '/dungeons/the-nest-philadelphia-poconos',
        permanent: true,
      },
      {
        source: '/dungeons/the-baltimore-playhouse/:path*',
        destination: '/dungeons/baltimore-playhouse',
        permanent: true,
      },
      {
        source: '/dungeons/honeypotdungeon/:path*',
        destination: '/dungeons/the-honey-pot-arundel-county',
        permanent: true,
      },
      {
        source: '/dungeons/ohiosmart/:path*',
        destination: '/dungeons/ohiosmart-dungeon-cleveland',
        permanent: true,
      },
      {
        source: '/dungeons/sarasotadarktemple/:path*',
        destination: '/dungeons/sarasota-dark-temple',
        permanent: true,
      },
      {
        source: '/dungeons/theaphroditegroup/:path*',
        destination: '/dungeons/the-aphrodite-group',
        permanent: true,
      },
      {
        source: '/dungeons/thecrubible/:path*',
        destination: '/dungeons/the-crucible-washington-dc',
        permanent: true,
      },
      {
        source: '/dungeons/thewoodshed/:path*',
        destination: '/dungeons/the-woodshed-orlando-florida',
        permanent: true,
      },
      // Fix event URL typo (typo correction only - trailing slashes handled automatically)
      {
        source: '/events/costal-carolina-fetish-fair/:path*',
        destination: '/events/coastal-carolina-fetish-fair',
        permanent: true,
      },
      // Handle removed education articles
      {
        source: '/education/nipple-play-beginners-guide',
        destination: '/education',
        permanent: true,
      },
      // Redirect old giving page
      {
        source: '/giving-page-1-1',
        destination: '/contact',
        permanent: true,
      },
      // Redirect old kinkeventcalendar category URLs
      {
        source: '/kinkeventcalendar',
        has: [
          {
            type: 'query',
            key: 'category',
            value: '(?<category>.*)',
          },
        ],
        destination: '/events?category=:category',
        permanent: true,
      },
      // Redirect category URLs with query parameters to events page
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'category',
            value: '(?<category>.*)',
          },
        ],
        destination: '/events?category=:category',
        permanent: true,
      },
    ]
  },

  webpack: (config, { isServer }) => {
    // Ignore critical dependency warnings for @supabase/realtime-js
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js\/dist\/module\/lib\/websocket-factory\.js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow' },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://vercel.live; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live wss://*.vercel.live; " +
              "frame-src 'self' https://vercel.live; " +
              "object-src 'none'; base-uri 'self'; form-action 'self';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 