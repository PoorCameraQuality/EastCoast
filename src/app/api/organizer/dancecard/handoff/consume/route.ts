import { NextRequest, NextResponse } from 'next/server'
import { verifyC2kHandoffCode, c2kReturnUrl, consumeC2kHandoffCode } from '@/lib/dancecard/c2kHandoff'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  let body: { code?: string }
  try {
    body = (await request.json()) as { code?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const code = body.code?.trim()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const payload = verifyC2kHandoffCode(code)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired handoff code' }, { status: 401 })
  }

  if (!consumeC2kHandoffCode(code)) {
    return NextResponse.json({ error: 'Handoff code already used' }, { status: 401 })
  }

  const returnUrl = c2kReturnUrl(payload.c2kConventionSlug)
  const redirectTo = `/organizer/dancecard/${encodeURIComponent(payload.dancecardSlug)}?from=c2k&convention=${encodeURIComponent(payload.c2kConventionSlug)}`

  return NextResponse.json({
    dancecardSlug: payload.dancecardSlug,
    c2kConventionSlug: payload.c2kConventionSlug,
    redirectTo,
    returnUrl: returnUrl || null,
    emailHint: payload.email ?? null,
  })
}
