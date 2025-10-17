import { NextRequest, NextResponse } from "next/server"
import { submitSitemapToIndexNow, submitContentToIndexNow } from "@/lib/indexnow"

export const runtime = "nodejs"

/**
 * Submit URLs via IndexNow (Google/Bing sitemap ping endpoints are deprecated)
 * 
 * Note: Google deprecated /ping?sitemap= endpoint (returns 404)
 * Bing removed anonymous sitemap pings (returns 410)
 * Use Search Console for Google and IndexNow for both engines
 */
export async function POST(request: NextRequest) {
  try {
    const { indexNow = true, includeContent = true } = await request.json().catch(() => ({}))
    
    const results = {
      timestamp: new Date().toISOString(),
      indexNow: {} as any,
      note: "Google/Bing sitemap ping endpoints are deprecated. Use Search Console for Google and IndexNow for both engines."
    }

    // Submit URLs via IndexNow
    if (indexNow) {
      try {
        // Submit core sitemap URLs (always include these)
        const sitemapResult = await submitSitemapToIndexNow()
        
        let contentResult = { submittedCount: 0, status: 200, statusText: "Skipped" }
        
        // Optionally submit content URLs (events, dungeons, articles)
        if (includeContent) {
          contentResult = await submitContentToIndexNow()
        }
        
        results.indexNow = {
          sitemap: sitemapResult,
          content: includeContent ? contentResult : null,
          totalSubmitted: sitemapResult.submittedCount + contentResult.submittedCount,
          success: sitemapResult.status === 200
        }
      } catch (error) {
        results.indexNow = {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false
        }
      }
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error('[IndexNow Ping] Error:', error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual sitemap ping
 */
export async function GET() {
  return POST(new NextRequest("http://localhost", { 
    method: "POST",
    body: JSON.stringify({ searchEngines: true, indexNow: true })
  }))
}