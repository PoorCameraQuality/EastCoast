/**
 * IndexNow utility functions for submitting URLs to search engines
 */

const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const INDEXNOW_KEY = "0050cb815778482eafc98bbf0849daad"
const KEY_LOCATION = "https://www.eastcoastkinkevents.com/0050cb815778482eafc98bbf0849daad.txt"
const BASE_URL = "https://www.eastcoastkinkevents.com"

interface IndexNowResponse {
  status: number
  statusText: string
  submittedCount: number
  skippedCount?: number
  urls?: string[]
  error?: string
}

/**
 * Submit URLs to IndexNow API
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResponse> {
  try {
    // Validate and filter URLs
    const validUrls = urls
      .filter(url => {
        try {
          const urlObj = new URL(url)
          return urlObj.hostname === "www.eastcoastkinkevents.com"
        } catch {
          return false
        }
      })
      .slice(0, 10000) // IndexNow limit

    if (validUrls.length === 0) {
      return {
        status: 422,
        statusText: "No valid URLs",
        submittedCount: 0,
        error: "No valid URLs for this domain found"
      }
    }

    const requestBody = {
      host: "www.eastcoastkinkevents.com",
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: validUrls
    }

    const response = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(requestBody)
    })

    const result: IndexNowResponse = {
      status: response.status,
      statusText: response.statusText,
      submittedCount: validUrls.length,
      skippedCount: urls.length - validUrls.length,
      urls: validUrls
    }

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${response.statusText}`
    }

    return result

  } catch (error) {
    console.error('[IndexNow] Error submitting URLs:', error)
    return {
      status: 500,
      statusText: "Internal Server Error",
      submittedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResponse> {
  return submitToIndexNow([url])
}

/**
 * Generate URLs for sitemap submission
 */
export function generateSitemapUrls(): string[] {
  const stateSlugs = [
    "new-york", "pennsylvania", "new-jersey", "maryland", "delaware",
    "virginia", "north-carolina", "south-carolina", "georgia", "florida",
    "maine", "vermont", "new-hampshire", "massachusetts", "rhode-island",
    "connecticut", "washington-dc"
  ]

  const coreUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/events`,
    `${BASE_URL}/dungeons`,
    `${BASE_URL}/education`,
    `${BASE_URL}/calendar`,
    `${BASE_URL}/guidelines`,
    `${BASE_URL}/states`
  ]

  const stateUrls = stateSlugs.map(slug => `${BASE_URL}/states/${slug}`)

  return [...coreUrls, ...stateUrls]
}

/**
 * Submit sitemap URLs to IndexNow
 */
export async function submitSitemapToIndexNow(): Promise<IndexNowResponse> {
  const urls = generateSitemapUrls()
  return submitToIndexNow(urls)
}

/**
 * Submit all content URLs (events, dungeons, articles) to IndexNow
 */
export async function submitContentToIndexNow(): Promise<IndexNowResponse> {
  try {
    // Get URLs from our sitemap APIs
    const [events, dungeons, articles] = await Promise.all([
      fetch(`${BASE_URL}/api/sitemap/events`).then(r => r.ok ? r.json() : []),
      fetch(`${BASE_URL}/api/sitemap/dungeons`).then(r => r.ok ? r.json() : []),
      fetch(`${BASE_URL}/api/sitemap/articles`).then(r => r.ok ? r.json() : [])
    ])

    const eventUrls = (events || []).map((e: any) => `${BASE_URL}/events/${e.slug}`)
    const dungeonUrls = (dungeons || []).map((d: any) => `${BASE_URL}/dungeons/${d.slug}`)
    const articleUrls = (articles || []).map((a: any) => `${BASE_URL}/education/${a.slug}`)

    const allUrls = [...eventUrls, ...dungeonUrls, ...articleUrls]
    
    return submitToIndexNow(allUrls)
  } catch (error) {
    console.error('[IndexNow] Error getting content URLs:', error)
    return {
      status: 500,
      statusText: "Internal Server Error",
      submittedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}