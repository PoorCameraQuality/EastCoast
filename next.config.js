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
      // Redirect old event URLs with year suffixes
      {
        source: '/kinkeventcalendar/campcrucible2024',
        destination: '/events/camp-crucible',
        permanent: true,
      },
      // Redirect old dungeon URLs
      {
        source: '/dungeons/ascendcommunity',
        destination: '/dungeons/ascend-community',
        permanent: true,
      },
      // Redirect old giving page
      {
        source: '/giving-page-1-1',
        destination: '/contact',
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