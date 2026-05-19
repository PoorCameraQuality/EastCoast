import { NextRequest, NextResponse } from 'next/server'
import { normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  const slug = normalizeEventSlug(context.params.eventSlug)
  return NextResponse.json(
    {
      error:
        'This registration form is no longer available. Create a dancecard account on the event page (Member access → Register).',
      registerUrl: `/dancecard/${encodeURIComponent(slug)}?auth=register#dc-sign-in`,
    },
    { status: 410 },
  )
}
