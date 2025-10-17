import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Import dungeons from local data file
    const { dungeons } = await import("@/data/dungeons")
    
    // Map to sitemap format with null for updated (static content)
    const rows = (dungeons || [])
      .filter(dungeon => dungeon.slug) // Only include dungeons with valid slugs
      .map(dungeon => ({
        slug: dungeon.slug,
        updated: null // Dungeons are static content, no update dates
      }))
    
    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error('[Sitemap API] Error importing dungeons:', error)
    return NextResponse.json([], { status: 200 })
  }
}
