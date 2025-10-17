import { NextRequest, NextResponse } from "next/server"
import { submitSitemapToIndexNow, submitContentToIndexNow } from "@/lib/indexnow"

export const runtime = "nodejs"

/**
 * Ping search engines about sitemap updates and submit URLs via IndexNow
 */
export async function POST(request: NextRequest) {
  try {
    const { searchEngines = true, indexNow = true } = await request.json().catch(() => ({}))
    
    const results = {
      timestamp: new Date().toISOString(),
      sitemapPings: {} as Record<string, any>,
      indexNow: {} as any
    }

    // Ping search engines about sitemap
    if (searchEngines) {
      const sitemapUrl = "https://www.eastcoastkinkevents.com/sitemap.xml"
      
      const pingUrls = [
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      ]

      for (const pingUrl of pingUrls) {
        try {
          const response = await fetch(pingUrl, { 
            method: "GET",
            headers: { "User-Agent": "EastCoastKinkEvents/1.0" }
          })
          
          const engine = pingUrl.includes("google") ? "google" : "bing"
          results.sitemapPings[engine] = {
            status: response.status,
            statusText: response.statusText,
            success: response.ok
          }
        } catch (error) {
          const engine = pingUrl.includes("google") ? "google" : "bing"
          results.sitemapPings[engine] = {
            status: 500,
            statusText: "Error",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          }
        }
      }
    }

    // Submit URLs via IndexNow
    if (indexNow) {
      try {
        // Submit core sitemap URLs
        const sitemapResult = await submitSitemapToIndexNow()
        
        // Submit content URLs (events, dungeons, articles)
        const contentResult = await submitContentToIndexNow()
        
        results.indexNow = {
          sitemap: sitemapResult,
          content: contentResult,
          totalSubmitted: sitemapResult.submittedCount + contentResult.submittedCount
        }
      } catch (error) {
        results.indexNow = {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error('[Sitemap Ping] Error:', error)
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