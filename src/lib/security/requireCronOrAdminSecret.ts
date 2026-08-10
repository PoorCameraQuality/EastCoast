import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Protect IndexNow / sitemap ping / cron-style routes.
 * Accepts `Authorization: Bearer <CRON_SECRET|INDEXNOW_ADMIN_SECRET|DANCECARD_CRON_SECRET>`.
 */
export function requireCronOrAdminSecret(request: NextRequest): NextResponse | null {
  const secret =
    process.env.CRON_SECRET ||
    process.env.INDEXNOW_ADMIN_SECRET ||
    process.env.DANCECARD_CRON_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: 'Endpoint is not configured (missing CRON_SECRET).' },
      { status: 503 },
    )
  }

  const auth = request.headers.get('authorization') || ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
