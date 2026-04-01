/**
 * IndexNow utility functions for submitting URLs to search engines
 *
 * Hub URL sets should stay aligned with `buildDirectorySitemapUrls` in sitemapUrls.ts
 * (core + state hubs + allowlisted discovery paths). Detail URLs (events, dungeons, etc.)
 * are submitted via `submitContentToIndexNow`.
 */

import { getAllVendors } from '@/data/vendors'
import { buildAllowlistedBlogPaths } from '@/lib/blogDiscoveryTier'
import { buildAllowlistedDiscoveryPaths } from '@/lib/discoveryTier'
import { buildAllowlistedDungeonDiscoveryPaths } from '@/lib/dungeonDiscoveryTier'
import { buildAllowlistedSwingDiscoveryPaths } from '@/lib/swingDiscoveryTier'
import { getAllSwingClubs } from '@/data/swingClubs'
import { getStateSlugsForSitemap } from '@/lib/eastCoastStates'
import { buildAllowlistedVendorDiscoveryPaths } from '@/lib/vendorDiscoveryTier'
import { getSpiritualityKinkIndexPaths } from '@/lib/spiritualityKinkProgrammatic'

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

/** Full URLs for spirituality/kink programmatic hub (same paths as XML sitemap). */
export function spiritualityKinkUrlsForIndexNow(): string[] {
  return getSpiritualityKinkIndexPaths().map((path) => `${BASE_URL}${path}`)
}

function uniqueStrings(urls: string[]): string[] {
  return Array.from(new Set(urls))
}

/**
 * Hub & discovery URLs aligned with `buildDirectorySitemapUrls` core + state + allowlists
 * (not individual event/dungeon/education/vendor detail pages — those go through submitContentToIndexNow).
 */
export function generateSitemapUrls(): string[] {
  const coreHubs = [
    `${BASE_URL}/`,
    `${BASE_URL}/events`,
    `${BASE_URL}/dungeons`,
    `${BASE_URL}/education`,
    `${BASE_URL}/calendar`,
    `${BASE_URL}/states`,
    `${BASE_URL}/bdsm-events`,
    `${BASE_URL}/vendors`,
    `${BASE_URL}/blog`,
    ...spiritualityKinkUrlsForIndexNow(),
  ]

  const stateUrls = getStateSlugsForSitemap().map((slug) => `${BASE_URL}/states/${slug}`)

  const discoveryUrls = buildAllowlistedDiscoveryPaths().map((p) => `${BASE_URL}/${p}`)
  const vendorDiscoveryUrls = buildAllowlistedVendorDiscoveryPaths().map((p) => `${BASE_URL}/${p}`)
  const dungeonDiscoveryUrls = buildAllowlistedDungeonDiscoveryPaths().map((p) => `${BASE_URL}/${p}`)
  const swingDiscoveryUrls = buildAllowlistedSwingDiscoveryPaths().map((p) => `${BASE_URL}/${p}`)
  const blogProgrammaticUrls = buildAllowlistedBlogPaths().map((p) => `${BASE_URL}/${p}`)

  return uniqueStrings([
    ...coreHubs,
    ...stateUrls,
    ...discoveryUrls,
    ...vendorDiscoveryUrls,
    ...dungeonDiscoveryUrls,
    ...swingDiscoveryUrls,
    ...blogProgrammaticUrls,
  ])
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
    const swingClubUrls = getAllSwingClubs().map((c) => `${BASE_URL}/swing-clubs/${c.slug}`)
    const articleUrls = (articles || []).map((a: any) => `${BASE_URL}/education/${a.slug}`)
    const vendorUrls = getAllVendors().map((v) => `${BASE_URL}/vendors/${v.slug}`)

    const allUrls = [...eventUrls, ...dungeonUrls, ...swingClubUrls, ...articleUrls, ...vendorUrls]

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