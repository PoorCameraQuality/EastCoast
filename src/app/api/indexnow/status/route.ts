import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * IndexNow status and health check endpoint
 * Provides information about IndexNow configuration and recent activity
 */
export async function GET() {
  try {
    const keyFile = "https://www.eastcoastkinkevents.com/0050cb815778482eafc98bbf0849daad.txt"
    
    // Check if key file is accessible
    let keyFileStatus = { accessible: false, error: null as string | null }
    try {
      const keyResponse = await fetch(keyFile)
      if (keyResponse.ok) {
        const keyContent = await keyResponse.text()
        keyFileStatus = { 
          accessible: true, 
          error: keyContent.trim() === "0050cb815778482eafc98bbf0849daad" ? null : "Key content mismatch"
        }
      } else {
        keyFileStatus.error = `HTTP ${keyResponse.status}: ${keyResponse.statusText}`
      }
    } catch (error) {
      keyFileStatus.error = error instanceof Error ? error.message : "Unknown error"
    }

    const status = {
      timestamp: new Date().toISOString(),
      configuration: {
        key: "0050cb815778482eafc98bbf0849daad",
        keyLocation: keyFile,
        keyFileStatus,
        apiEndpoint: "https://api.indexnow.org/indexnow",
        domain: "www.eastcoastkinkevents.com"
      },
      endpoints: {
        submit: "/api/indexnow",
        ping: "/api/sitemap/ping",
        status: "/api/indexnow/status"
      },
      usage: {
        singleUrl: "GET /api/indexnow?url=<url>",
        bulkUrls: "POST /api/indexnow with {urlList: [url1, url2, ...]}",
        sitemapPing: "POST /api/sitemap/ping with {indexNow: true, includeContent: true}",
        quickSubmit: "node scripts/quick-indexnow.js <url>",
        postDeploy: "node scripts/post-deploy-indexnow.js"
      },
      notes: [
        "Google/Bing sitemap ping endpoints are deprecated (404/410 expected)",
        "Use Search Console for Google sitemap management",
        "IndexNow supports Bing, Yandex, and other search engines",
        "Submit up to 10,000 URLs per request",
        "Monitor submissions in Bing Webmaster Tools"
      ],
      health: {
        keyFileAccessible: keyFileStatus.accessible,
        apiConfigured: true,
        status: keyFileStatus.accessible ? "healthy" : "warning"
      }
    }

    return NextResponse.json(status, { 
      status: keyFileStatus.accessible ? 200 : 503,
      headers: {
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes
      }
    })

  } catch (error) {
    console.error('[IndexNow Status] Error:', error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
