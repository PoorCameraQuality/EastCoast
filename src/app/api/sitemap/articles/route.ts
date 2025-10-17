import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Prefer local data to avoid runtime DB dependencies
    const { getAllArticles } = await import('@/data/education')
    const articles = getAllArticles?.() || []

    const rows = articles
      .filter((a: any) => a?.slug && a?.status === 'published')
      .map((a: any) => ({
        slug: a.slug,
        // Use lastUpdated if available, else publishDate
        updated: (a.lastUpdated || a.publishDate || '').toString()
      }))

    return NextResponse.json(rows, { status: 200 })
  } catch (error) {
    // Fail soft to keep sitemap healthy
    console.error('[Sitemap API] Error importing articles:', error)
    return NextResponse.json([], { status: 200 })
  }
}
