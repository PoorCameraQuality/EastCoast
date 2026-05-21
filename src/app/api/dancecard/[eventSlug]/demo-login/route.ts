import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { createSandboxDemoSessionResponse } from '@/lib/dancecard/sandboxDemoAuth'
import { normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'
import { toClientError } from '@/lib/security/safeApiError'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  personaId: z.enum(['alex', 'brax', 'casey']),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardAuth)
  if (limited) return limited

  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const body = bodySchema.parse(await request.json())
    return await createSandboxDemoSessionResponse(slug, body.personaId)
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid demo persona.' }, { status: 400 })
    }
    const { status, body } = toClientError(e, 'dancecard-demo-login')
    return NextResponse.json(body, { status })
  }
}
