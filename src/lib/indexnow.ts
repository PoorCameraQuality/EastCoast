/**
 * IndexNow utility for notifying Bing and other search engines of new/updated content
 * https://www.indexnow.org/
 */

const INDEXNOW_KEY = '33ef4629d0fdd1a995f5370f99e77d6b9cc217f6ef0dfc1ee2ee966846fea864'
const HOST = 'www.eastcoastkinkevents.com'
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`

export interface IndexNowResponse {
  success: boolean
  error?: string
}

/**
 * Notify IndexNow API of a single URL update
 */
export async function notifyIndexNow(url: string): Promise<IndexNowResponse> {
  try {
    // Only notify in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[IndexNow] Skipping notification in development:', url)
      return { success: true }
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: [url]
      }),
    })

    if (response.ok || response.status === 202) {
      console.log('[IndexNow] Successfully notified:', url)
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error('[IndexNow] Failed to notify:', response.status, errorText)
      return { success: false, error: `HTTP ${response.status}: ${errorText}` }
    }
  } catch (error) {
    console.error('[IndexNow] Error notifying:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Notify IndexNow API of multiple URL updates
 */
export async function notifyIndexNowBatch(urls: string[]): Promise<IndexNowResponse> {
  try {
    // Only notify in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[IndexNow] Skipping batch notification in development:', urls.length, 'URLs')
      return { success: true }
    }

    // IndexNow supports up to 10,000 URLs per request
    if (urls.length > 10000) {
      console.warn('[IndexNow] Too many URLs, truncating to 10,000')
      urls = urls.slice(0, 10000)
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls
      }),
    })

    if (response.ok || response.status === 202) {
      console.log('[IndexNow] Successfully notified batch:', urls.length, 'URLs')
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error('[IndexNow] Failed to notify batch:', response.status, errorText)
      return { success: false, error: `HTTP ${response.status}: ${errorText}` }
    }
  } catch (error) {
    console.error('[IndexNow] Error notifying batch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Helper to notify about a new event
 */
export async function notifyNewEvent(eventSlug: string): Promise<IndexNowResponse> {
  const url = `https://${HOST}/events/${eventSlug}`
  return notifyIndexNow(url)
}

/**
 * Helper to notify about a new dungeon
 */
export async function notifyNewDungeon(dungeonSlug: string): Promise<IndexNowResponse> {
  const url = `https://${HOST}/dungeons/${dungeonSlug}`
  return notifyIndexNow(url)
}

/**
 * Helper to notify about a new education article
 */
export async function notifyNewArticle(articleSlug: string): Promise<IndexNowResponse> {
  const url = `https://${HOST}/education/${articleSlug}`
  return notifyIndexNow(url)
}

