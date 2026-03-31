import { NextResponse } from 'next/server'

const BASE = 'https://www.eastcoastkinkevents.com'

export async function GET() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'contact@eastcoastkinkevents.com'

  const body = {
    schema_version: 'v1',
    name_for_human: 'East Coast Kink Events',
    name_for_model: 'ecke_directory',
    description_for_human:
      'Find BDSM dungeons, swing and lifestyle clubs, kink events, and education hubs across the United States.',
    description_for_model:
      'Use this tool to retrieve ECKE public directory exports: permanent community venues (BDSM dungeons and swing/lifestyle clubs in one dataset), recurring events, and aggregate stats. Data is read-only JSON at /export/ . Listings are curated for community-oriented spaces; confirm details on each official site before visiting.',
    api: {
      type: 'openapi',
      url: `${BASE}/.well-known/openapi.yaml`,
    },
    logo_url: process.env.NEXT_PUBLIC_PLUGIN_LOGO_URL?.trim() || `${BASE}/og-image.png`,
    contact_email: contactEmail,
    legal_info_url: `${BASE}/terms`,
  }

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
