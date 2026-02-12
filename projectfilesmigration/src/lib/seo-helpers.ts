/**
 * SEO helper utilities for title generation and validation
 */

const MAX_TITLE_LENGTH = 60
const BRAND_NAME = "East Coast Kink Events"
const BRAND_SHORT = "East Coast Kink Events"

/**
 * Smart title truncation that preserves important parts
 */
export function truncateTitle(title: string, maxLength: number = MAX_TITLE_LENGTH): string {
  if (title.length <= maxLength) {
    return title
  }

  // Split title into parts (usually separated by " | ")
  const parts = title.split(' | ')
  if (parts.length >= 2) {
    const mainPart = parts[0]
    const brandPart = parts[1]
    
    // Try to fit main part + brand, but truncate main part if needed
    const brandLength = brandPart.length + 3 // +3 for " | "
    const availableForMain = maxLength - brandLength
    
    if (availableForMain > 10) { // Ensure we have meaningful content
      return `${mainPart.substring(0, availableForMain - 3)}... | ${brandPart}`
    }
  }

  // Fallback: simple truncation
  return title.substring(0, maxLength - 3) + '...'
}

/**
 * Validate title length and warn if too long
 */
export function validateTitleLength(title: string): { valid: boolean; length: number; warning?: string } {
  const length = title.length
  const valid = length <= MAX_TITLE_LENGTH
  
  return {
    valid,
    length,
    warning: valid ? undefined : `Title is ${length} characters (max ${MAX_TITLE_LENGTH})`
  }
}

/**
 * Generate optimized event title
 * Format: [Event Name] [Year] | [Brand]
 */
export function generateEventTitle(event: any): string {
  const year = event.date?.start ? new Date(event.date.start).getFullYear() : ''
  const eventName = event.name
  
  // Try different title formats based on length
  let title = `${eventName} ${year} | ${BRAND_NAME}`
  
  // If too long, try with short brand
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${eventName} ${year} | ${BRAND_SHORT}`
  }
  
  // If still too long, remove year
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${eventName} | ${BRAND_SHORT}`
  }
  
  // If still too long, truncate event name
  if (title.length > MAX_TITLE_LENGTH) {
    const brandLength = BRAND_SHORT.length + 3 // +3 for " | "
    const availableForEvent = MAX_TITLE_LENGTH - brandLength
    title = `${eventName.substring(0, availableForEvent - 3)}... | ${BRAND_SHORT}`
  }
  
  return title
}

/**
 * Generate optimized dungeon title
 * Format: [Dungeon Name] - [City, ST] | [Brand]
 */
export function generateDungeonTitle(dungeon: any): string {
  const location = `${dungeon.location.city}, ${dungeon.location.state}`
  let title = `${dungeon.name} - ${location} | ${BRAND_NAME}`
  
  // If too long, try with short brand
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${dungeon.name} - ${location} | ${BRAND_SHORT}`
  }
  
  // If still too long, remove location
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${dungeon.name} | ${BRAND_SHORT}`
  }
  
  // If still too long, truncate dungeon name
  if (title.length > MAX_TITLE_LENGTH) {
    const brandLength = BRAND_SHORT.length + 3 // +3 for " | "
    const availableForDungeon = MAX_TITLE_LENGTH - brandLength
    title = `${dungeon.name.substring(0, availableForDungeon - 3)}... | ${BRAND_SHORT}`
  }
  
  return title
}

/**
 * Generate optimized article title
 * Format: [Article Title] | [Brand]
 */
export function generateArticleTitle(article: any): string {
  let title = `${article.title} | ${BRAND_NAME}`
  
  // If too long, try with short brand
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${article.title} | ${BRAND_SHORT}`
  }
  
  // If still too long, truncate article title
  if (title.length > MAX_TITLE_LENGTH) {
    const brandLength = BRAND_SHORT.length + 3 // +3 for " | "
    const availableForArticle = MAX_TITLE_LENGTH - brandLength
    title = `${article.title.substring(0, availableForArticle - 3)}... | ${BRAND_SHORT}`
  }
  
  return title
}

/**
 * Test all titles from data files
 */
export function testAllTitles(): { events: any[], dungeons: any[], articles: any[] } {
  const results = { events: [], dungeons: [], articles: [] }
  
  // Test events
  try {
    const path = require('path')
    const eventsPath = path.join(__dirname, '../data/events.js')
    const { events } = require(eventsPath)
    results.events = events.map((event: any) => {
      const title = generateEventTitle(event)
      const validation = validateTitleLength(title)
      return {
        slug: event.slug,
        name: event.name,
        title,
        length: validation.length,
        valid: validation.valid,
        warning: validation.warning
      }
    })
  } catch (error) {
    console.error('Error testing event titles:', error)
  }
  
  // Test dungeons
  try {
    const path = require('path')
    const dungeonsPath = path.join(__dirname, '../data/dungeons.js')
    const { dungeons } = require(dungeonsPath)
    results.dungeons = dungeons.map((dungeon: any) => {
      const title = generateDungeonTitle(dungeon)
      const validation = validateTitleLength(title)
      return {
        slug: dungeon.slug,
        name: dungeon.name,
        title,
        length: validation.length,
        valid: validation.valid,
        warning: validation.warning
      }
    })
  } catch (error) {
    console.error('Error testing dungeon titles:', error)
  }
  
  return results
}

/**
 * Get statistics about title lengths
 */
export function getTitleStats(results: any): {
  total: number
  valid: number
  invalid: number
  averageLength: number
  longestTitle: string
  longestLength: number
} {
  const allTitles = [...results.events, ...results.dungeons, ...results.articles]
  const valid = allTitles.filter(t => t.valid).length
  const invalid = allTitles.filter(t => !t.valid).length
  const total = allTitles.length
  const averageLength = total > 0 ? Math.round(allTitles.reduce((sum, t) => sum + t.length, 0) / total) : 0
  
  const longest = allTitles.reduce((longest, current) => 
    current.length > longest.length ? current : longest, 
    { length: 0, title: '' }
  )
  
  return {
    total,
    valid,
    invalid,
    averageLength,
    longestTitle: longest.title,
    longestLength: longest.length
  }
}
