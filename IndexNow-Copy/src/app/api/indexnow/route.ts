import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const INDEXNOW_KEY = "0050cb815778482eafc98bbf0849daad"
const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const KEY_LOCATION = "https://www.eastcoastkinkevents.com/0050cb815778482eafc98bbf0849daad.txt"

interface IndexNowRequest {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { urlList } = await request.json()
    
    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return NextResponse.json(
        { error: "urlList is required and must be a non-empty array" },
        { status: 400 }
      )
    }

    // Validate URLs belong to our domain
    const validUrls = urlList.filter(url => {
      try {
        const urlObj = new URL(url)
        return urlObj.hostname === "www.eastcoastkinkevents.com"
      } catch {
        return false
      }
    })

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid URLs for this domain found" },
        { status: 422 }
      )
    }

    // Limit to 10,000 URLs per request (IndexNow limit)
    const urlsToSubmit = validUrls.slice(0, 10000)

    const indexNowRequest: IndexNowRequest = {
      host: "www.eastcoastkinkevents.com",
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlsToSubmit
    }

    const response = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(indexNowRequest)
    })

    const result = {
      status: response.status,
      statusText: response.statusText,
      submittedCount: urlsToSubmit.length,
      skippedCount: validUrls.length - urlsToSubmit.length,
      urls: urlsToSubmit
    }

    if (response.ok) {
      console.log(`[IndexNow] Successfully submitted ${urlsToSubmit.length} URLs`)
      return NextResponse.json(result, { status: 200 })
    } else {
      console.error(`[IndexNow] Error submitting URLs:`, result)
      return NextResponse.json(result, { status: response.status })
    }

  } catch (error) {
    console.error('[IndexNow] Unexpected error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to submit a single URL
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json(
      { error: "url parameter is required" },
      { status: 400 }
    )
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urlList: [url] })
  }))
}
