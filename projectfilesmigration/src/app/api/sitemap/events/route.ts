import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Import events from local data file
    const { events } = await import("@/data/events")
    
    // Map to sitemap format using date.start for lastmod
    const rows = (events || [])
      .filter(event => event.slug) // Only include events with valid slugs
      .map(event => ({
        slug: event.slug,
        updated: event.date?.start || null
      }))
    
    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error('[Sitemap API] Error importing events:', error)
    return NextResponse.json([], { status: 200 })
  }
}
