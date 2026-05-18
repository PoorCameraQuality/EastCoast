import { NextRequest, NextResponse } from 'next/server'
import { processDancecardWebhookRetries } from '@/lib/dancecard/webhookRetry'
import { getDancecardAdmin } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = process.env.DANCECARD_CRON_SECRET ?? process.env.CRON_SECRET
  const auth = request.headers.get('authorization') ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const admin = getDancecardAdmin()
    const result = await processDancecardWebhookRetries(admin)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
