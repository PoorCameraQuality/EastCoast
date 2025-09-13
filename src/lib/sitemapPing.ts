/**
 * Sitemap Ping Utility
 * Automatically notifies search engines when new content is published
 */

interface PingResult {
  success: boolean
  engine: string
  error?: string
}

/**
 * Ping search engines to notify them of sitemap updates
 * Call this function whenever new content is published to the database
 */
export async function pingSitemapToSearchEngines(): Promise<PingResult[]> {
  const sitemapUrl = 'https://eastcoastkinkevents.com/sitemap.xml'
  const results: PingResult[] = []

  // Google Search Console ping
  try {
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    const googleResponse = await fetch(googlePingUrl, { 
      method: 'GET',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    })
    
    results.push({
      success: googleResponse.ok,
      engine: 'Google',
      error: googleResponse.ok ? undefined : `HTTP ${googleResponse.status}`
    })
  } catch (error) {
    results.push({
      success: false,
      engine: 'Google',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Bing Webmaster Tools ping
  try {
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    const bingResponse = await fetch(bingPingUrl, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    })
    
    results.push({
      success: bingResponse.ok,
      engine: 'Bing',
      error: bingResponse.ok ? undefined : `HTTP ${bingResponse.status}`
    })
  } catch (error) {
    results.push({
      success: false,
      engine: 'Bing',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  return results
}

/**
 * Ping search engines with error handling and logging
 * Safe to call from API routes - won't throw errors
 */
export async function safePingSitemap(): Promise<void> {
  try {
    const results = await pingSitemapToSearchEngines()
    
    // Log results for monitoring
    console.log('Sitemap ping results:', results)
    
    // Track successful pings
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    if (successful.length > 0) {
      console.log(`✅ Successfully pinged: ${successful.map(r => r.engine).join(', ')}`)
    }
    
    if (failed.length > 0) {
      console.warn(`⚠️ Failed to ping: ${failed.map(r => `${r.engine} (${r.error})`).join(', ')}`)
    }
  } catch (error) {
    console.error('Error pinging sitemap:', error)
    // Don't throw - this should never break the main functionality
  }
}

/**
 * Debounced sitemap ping to avoid spamming search engines
 * Use this for high-frequency content updates
 */
let pingTimeout: NodeJS.Timeout | null = null

export function debouncedSitemapPing(delayMs: number = 300000): void { // 5 minutes default
  if (pingTimeout) {
    clearTimeout(pingTimeout)
  }
  
  pingTimeout = setTimeout(() => {
    safePingSitemap()
    pingTimeout = null
  }, delayMs)
}
