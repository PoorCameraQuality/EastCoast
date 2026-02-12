import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Import dungeons from local data file
    const { dungeons } = await import("@/data/dungeons")
    
    // Map to sitemap format with null for updated (static content)
    const today = new Date().toISOString()
    const rows = (dungeons || [])
      .filter(dungeon => dungeon.slug) // Only include dungeons with valid slugs
      .map(dungeon => ({
        slug: dungeon.slug,
        // Use a deterministic lastmod: if dungeon has updated field use it, otherwise today
        updated: (dungeon as any).updated_at || (dungeon as any).updated || today
      }))
    
    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    console.error('[Sitemap API] Error importing dungeons:', error)
    return NextResponse.json([], { status: 200 })
  }
}
