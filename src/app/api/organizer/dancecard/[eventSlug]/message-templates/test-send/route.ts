import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { sendViaResend } from '@/lib/dancecard/resendOutbound'

export const dynamic = 'force-dynamic'

const schema = z.object({
  toEmail: z.string().email(),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(20000),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const body = schema.parse(await request.json())

    if (!process.env.RESEND_API_KEY?.trim() || !process.env.DANCECARD_RESEND_FROM?.trim()) {
      return NextResponse.json(
        {
          error:
            'Email is not configured. Set RESEND_API_KEY and DANCECARD_RESEND_FROM (see docs/dancecard-first-run.md).',
        },
        { status: 503 },
      )
    }

    const out = await sendViaResend({
      to: body.toEmail.trim(),
      subject: `[Test] ${body.subject.trim()}`,
      text: body.bodyText.trim(),
    })

    return NextResponse.json({ ok: true, providerMessageId: out.id ?? null })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    if (msg === 'RESEND_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Email is not configured.' }, { status: 503 })
    }
    return organizerErrorResponse(e)
  }
}
