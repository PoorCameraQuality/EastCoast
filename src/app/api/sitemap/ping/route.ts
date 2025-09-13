import { NextRequest, NextResponse } from 'next/server'
import { safePingSitemap } from '@/lib/sitemapPing'

/**
 * Webhook endpoint for triggering sitemap pings
 * Can be called from:
 * - Database triggers (Supabase Edge Functions)
 * - External scripts
 * - Manual operations
 * - Bulk imports
 */

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for security
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.SITEMAP_WEBHOOK_TOKEN
    
    // If token is configured, require it
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body for logging (optional)
    let body = null
    try {
      body = await request.json()
    } catch {
      // Body is optional - could be a simple ping
    }

    // Log the ping request for monitoring
    console.log('Sitemap ping triggered:', {
      timestamp: new Date().toISOString(),
      source: body?.source || 'unknown',
      contentType: body?.contentType || 'unknown',
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    // Ping search engines
    await safePingSitemap()

    return NextResponse.json({
      success: true,
      message: 'Sitemap ping initiated',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sitemap ping webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow GET requests for simple pings (no auth required for GET)
export async function GET() {
  try {
    console.log('Sitemap ping triggered via GET request')
    await safePingSitemap()
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap ping initiated via GET',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sitemap ping GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
