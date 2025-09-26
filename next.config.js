/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },

  env: {
    DISABLE_VERCEL_FEEDBACK: 'true'
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
      // Redirect old kinkeventcalendar URLs to new events structure
      {
        source: '/kinkeventcalendar/:slug',
        destination: '/events/:slug',
        permanent: true,
      },
      // Redirect old kinkeducationcenter URLs to new education structure
      {
        source: '/kinkeducationcenter/:slug',
        destination: '/education/:slug',
        permanent: true,
      },
      // Redirect old kinkeducationcenter base URL
      {
        source: '/kinkeducationcenter',
        destination: '/education',
        permanent: true,
      },
      // Specific redirects for known 404 URLs
      {
        source: '/kinkeducationcenter/bdsm-10-submission-types',
        destination: '/education/bdsm-10-submission-types',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/the-subtle-or-not-so-subtle-art-of-mental-bdsm',
        destination: '/education/the-subtle-or-not-so-subtle-art-of-mental-bdsm',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/hottest-bdsm-events-of-summer-2024',
        destination: '/education/hottest-bdsm-events-of-summer-2024',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/are-bdsm-dungeons-legal',
        destination: '/education/are-bdsm-dungeons-legal',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/is-bdsm-legal',
        destination: '/education/is-bdsm-legal',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/bdsm-breast-torture',
        destination: '/education/bdsm-breast-torture',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/the-origin-of-bdsm',
        destination: '/education/the-origin-of-bdsm',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/the-hottest-kink-events-for-winter-2024-2025',
        destination: '/education/the-hottest-kink-events-for-winter-2024-2025',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/bdsmstoplightsystem',
        destination: '/education/bdsm-stoplight-system',
        permanent: true,
      },
      {
        source: '/kinkeducationcenter/consent101',
        destination: '/education/consent-101',
        permanent: true,
      },
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
      // Fix trailing slash issues for events
      {
        source: '/events/kinkycon-summer-co-op/',
        destination: '/events/kinkycon-summer-co-op',
        permanent: true,
      },
      {
        source: '/events/dungeons-and-geekdoms/',
        destination: '/events/dungeons-geekdoms',
        permanent: true,
      },
      // Redirect old dungeon URLs
      {
        source: '/dungeons/ascendcommunity',
        destination: '/dungeons/ascend-community',
        permanent: true,
      },
      {
        source: '/dungeons/theowlsnest',
        destination: '/dungeons/the-nest-philadelphia-poconos',
        permanent: true,
      },
      {
        source: '/dungeons/theowlsnest/',
        destination: '/dungeons/the-nest-philadelphia-poconos',
        permanent: true,
      },
      {
        source: '/dungeons/the-baltimore-playhouse',
        destination: '/dungeons/baltimore-playhouse',
        permanent: true,
      },
      {
        source: '/dungeons/the-baltimore-playhouse/',
        destination: '/dungeons/baltimore-playhouse',
        permanent: true,
      },
      {
        source: '/dungeons/honeypotdungeon',
        destination: '/dungeons/the-honey-pot-arundel-county',
        permanent: true,
      },
      {
        source: '/dungeons/honeypotdungeon/',
        destination: '/dungeons/the-honey-pot-arundel-county',
        permanent: true,
      },
      {
        source: '/dungeons/ohiosmart',
        destination: '/dungeons/ohiosmart-dungeon-cleveland',
        permanent: true,
      },
      {
        source: '/dungeons/sarasotadarktemple',
        destination: '/dungeons/sarasota-dark-temple',
        permanent: true,
      },
      {
        source: '/dungeons/sarasotadarktemple/',
        destination: '/dungeons/sarasota-dark-temple',
        permanent: true,
      },
      {
        source: '/dungeons/theaphroditegroup',
        destination: '/dungeons/the-aphrodite-group',
        permanent: true,
      },
      {
        source: '/dungeons/theaphroditegroup/',
        destination: '/dungeons/the-aphrodite-group',
        permanent: true,
      },
      {
        source: '/dungeons/thecrubible',
        destination: '/dungeons/the-crucible-washington-dc',
        permanent: true,
      },
      {
        source: '/dungeons/thecrubible/',
        destination: '/dungeons/the-crucible-washington-dc',
        permanent: true,
      },
      {
        source: '/dungeons/thewoodshed',
        destination: '/dungeons/the-woodshed-orlando-florida',
        permanent: true,
      },
      {
        source: '/dungeons/thewoodshed/',
        destination: '/dungeons/the-woodshed-orlando-florida',
        permanent: true,
      },
      // Fix event URL typo
      {
        source: '/events/costal-carolina-fetish-fair',
        destination: '/events/coastal-carolina-fetish-fair',
        permanent: true,
      },
      {
        source: '/events/costal-carolina-fetish-fair/',
        destination: '/events/coastal-carolina-fetish-fair',
        permanent: true,
      },
      // Fix trailing slash issues for events
      {
        source: '/events/naughty-gras/',
        destination: '/events/naughty-gras',
        permanent: true,
      },
      {
        source: '/events/naughty-noel/',
        destination: '/events/naughty-noel',
        permanent: true,
      },
      {
        source: '/events/coastal-carolina-fetish-fair/',
        destination: '/events/coastal-carolina-fetish-fair',
        permanent: true,
      },
      {
        source: '/events/exploration-into-kink/',
        destination: '/events/exploration-into-kink',
        permanent: true,
      },
      {
        source: '/events/ohio-smart-fetish-flea/',
        destination: '/events/ohio-smart-fetish-flea',
        permanent: true,
      },
      {
        source: '/events/kinky-kollege/',
        destination: '/events/kinky-kollege',
        permanent: true,
      },
      {
        source: '/events/cruciblecon/',
        destination: '/events/cruciblecon',
        permanent: true,
      },
      {
        source: '/events/master-slave-conference-msc/',
        destination: '/events/master-slave-conference-msc',
        permanent: true,
      },
      // Fix trailing slash for privacy page
      {
        source: '/privacy/',
        destination: '/privacy',
        permanent: true,
      },
      // Fix trailing slash for education page
      {
        source: '/education/',
        destination: '/education',
        permanent: true,
      },
      // Fix trailing slash issues for more events
      {
        source: '/events/dark-odyssey-summer-camp/',
        destination: '/events/dark-odyssey-summer-camp',
        permanent: true,
      },
      {
        source: '/events/summer-michigan-rope-conference-smirc/',
        destination: '/events/summer-michigan-rope-conference-smirc',
        permanent: true,
      },
      {
        source: '/events/fornucopia/',
        destination: '/events/fornucopia',
        permanent: true,
      },
      // Fix trailing slash issues for dungeons
      {
        source: '/dungeons/ascend-hudson-valley-community/',
        destination: '/dungeons/ascend-hudson-valley-community',
        permanent: true,
      },
      {
        source: '/dungeons/the-aphrodite-group/',
        destination: '/dungeons/the-aphrodite-group',
        permanent: true,
      },
      {
        source: '/dungeons/the-honey-pot-arundel-county/',
        destination: '/dungeons/the-honey-pot-arundel-county',
        permanent: true,
      },
      {
        source: '/dungeons/the-nest-philadelphia-poconos/',
        destination: '/dungeons/the-nest-philadelphia-poconos',
        permanent: true,
      },
      {
        source: '/dungeons/ohiosmart-dungeon-cleveland/',
        destination: '/dungeons/ohiosmart-dungeon-cleveland',
        permanent: true,
      },
      {
        source: '/dungeons/sarasota-dark-temple/',
        destination: '/dungeons/sarasota-dark-temple',
        permanent: true,
      },
      // Fix AMP format parameter for old education URLs
      {
        source: '/kinkeducationcenter/bdsm-breast-torture',
        destination: '/education/bdsm-breast-torture',
        permanent: true,
      },
      // Handle removed education articles
      {
        source: '/education/nipple-play-beginners-guide',
        destination: '/education',
        permanent: true,
      },
      // Fix trailing slash issues for main pages
      {
        source: '/privacy/',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/calendar/',
        destination: '/calendar',
        permanent: true,
      },
      {
        source: '/contact/',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/guidelines/',
        destination: '/guidelines',
        permanent: true,
      },
      {
        source: '/terms/',
        destination: '/terms',
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 