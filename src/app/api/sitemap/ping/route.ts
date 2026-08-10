import { NextRequest, NextResponse } from "next/server"
import { submitSitemapToIndexNow, submitContentToIndexNow } from "@/lib/indexnow"
import { requireCronOrAdminSecret } from "@/lib/security/requireCronOrAdminSecret"

export const runtime = "nodejs"

/**
 * Submit URLs via IndexNow (Google/Bing sitemap ping endpoints are deprecated).
 * Requires Authorization: Bearer <CRON_SECRET|INDEXNOW_ADMIN_SECRET|DANCECARD_CRON_SECRET>.
 */
export async function POST(request: NextRequest) {
  const denied = requireCronOrAdminSecret(request)
  if (denied) return denied

  try {
    const {
      indexNow = true,
      includeContent = true,
      /** When false, only `submitContentToIndexNow` runs (large detail URL set). */
      coreSitemap = true,
    } = await request.json().catch(() => ({}))

    const results = {
      timestamp: new Date().toISOString(),
      indexNow: {} as Record<string, unknown>,
      note: "Google/Bing sitemap ping endpoints are deprecated. Use Search Console for Google and IndexNow for both engines."
    }

    if (indexNow) {
      try {
        let sitemapResult = {
          submittedCount: 0,
          status: 200,
          statusText: "Skipped",
          skippedCount: 0,
        } as Awaited<ReturnType<typeof submitSitemapToIndexNow>>

        if (coreSitemap) {
          sitemapResult = await submitSitemapToIndexNow()
        }

        let contentResult = { submittedCount: 0, status: 200, statusText: "Skipped" }

        if (includeContent) {
          contentResult = await submitContentToIndexNow()
        }

        const totalSubmitted = sitemapResult.submittedCount + contentResult.submittedCount
        const coreOk = !coreSitemap || sitemapResult.status === 200
        const contentOk = !includeContent || contentResult.status === 200

        results.indexNow = {
          sitemap: coreSitemap ? sitemapResult : { ...sitemapResult, statusText: "Skipped (coreSitemap: false)" },
          content: includeContent ? contentResult : null,
          totalSubmitted,
          success: coreOk && contentOk,
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

/** Manual sitemap ping — same auth as POST. */
export async function GET(request: NextRequest) {
  const denied = requireCronOrAdminSecret(request)
  if (denied) return denied

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ searchEngines: true, indexNow: true }),
    }),
  )
}
