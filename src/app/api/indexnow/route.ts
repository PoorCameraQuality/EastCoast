import { NextRequest, NextResponse } from "next/server"
import { submitToIndexNow } from "@/lib/indexnow"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { urlList } = await request.json()

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return NextResponse.json(
        { error: "urlList is required and must be a non-empty array" },
        { status: 400 }
      )
    }

    const result = await submitToIndexNow(urlList)

    const payload = {
      status: result.status,
      statusText: result.statusText,
      submittedCount: result.submittedCount,
      skippedCount: result.skippedCount ?? 0,
      urls: result.urls,
      error: result.error,
    }

    const httpStatus = result.status >= 400 ? result.status : 200
    return NextResponse.json(payload, { status: httpStatus })
  } catch (error) {
    console.error('[IndexNow] Unexpected error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "url parameter is required" }, { status: 400 })
  }

  const result = await submitToIndexNow([url])
  const payload = {
    status: result.status,
    statusText: result.statusText,
    submittedCount: result.submittedCount,
    skippedCount: result.skippedCount ?? 0,
    urls: result.urls,
    error: result.error,
  }
  return NextResponse.json(payload, { status: 200 })
}
